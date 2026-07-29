import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BatchResponse } from 'firebase-admin/messaging';
import { NotificationSettings } from '../../notification/models/notification-settings.model';
import { User } from '../../user/models/user.model';
import { FirebaseAdminService } from './firebase-admin.service';
import { DeviceTokenService } from './device-token.service';

export interface PushPayload {
  title: string;
  body: string;
  /** Extra key/values delivered with the message (values are stringified). */
  data?: Record<string, string | number | boolean>;
}

const FCM_MULTICAST_LIMIT = 500;
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

@Injectable()
export class PushService {
  constructor(
    private readonly firebase: FirebaseAdminService,
    private readonly deviceTokens: DeviceTokenService,
    @InjectModel(NotificationSettings)
    private readonly settingsModel: typeof NotificationSettings,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  /** Send to one user (respects their push preference). Best-effort. */
  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    return this.sendToUsers([userId], payload);
  }

  /** Send to every ADMIN / SUPER_ADMIN. Best-effort. */
  async sendToAdmins(payload: PushPayload): Promise<void> {
    const admins = await this.userModel.findAll({
      where: { role: { [Op.in]: ADMIN_ROLES } },
      attributes: ['id'],
    });
    await this.sendToUsers(
      admins.map((a) => a.id),
      payload,
    );
  }

  /**
   * Send to many users. Filters out anyone who turned push off, resolves their
   * device tokens, and delivers via FCM. Never throws — push is best-effort and
   * must not break the originating request.
   */
  async sendToUsers(userIds: string[], payload: PushPayload): Promise<void> {
    try {
      const messaging = this.firebase.messaging();
      if (!messaging) return; // push disabled — no credentials configured

      const allowed = await this.filterByPreference(userIds);
      if (!allowed.length) return;

      const tokens = await this.deviceTokens.tokensForUsers(allowed);
      if (!tokens.length) return;

      const data = this.stringifyData(payload.data);

      for (let i = 0; i < tokens.length; i += FCM_MULTICAST_LIMIT) {
        const batch = tokens.slice(i, i + FCM_MULTICAST_LIMIT);
        const res = await messaging.sendEachForMulticast({
          tokens: batch,
          notification: { title: payload.title, body: payload.body },
          ...(data ? { data } : {}),
        });
        await this.pruneInvalidTokens(batch, res);
      }
    } catch (err) {
      console.error('[PushService] send failed:', err);
    }
  }

  /** Users are opted-in unless they explicitly set pushNotification = false. */
  private async filterByPreference(userIds: string[]): Promise<string[]> {
    if (!userIds.length) return [];
    const settings = await this.settingsModel.findAll({
      where: { userId: { [Op.in]: userIds }, pushNotification: false },
      attributes: ['userId'],
    });
    const disabled = new Set(settings.map((s) => (s as any).userId));
    return userIds.filter((id) => !disabled.has(id));
  }

  private stringifyData(
    data?: Record<string, string | number | boolean>,
  ): Record<string, string> | undefined {
    if (!data) return undefined;
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)]),
    );
  }

  private async pruneInvalidTokens(
    tokens: string[],
    res: BatchResponse,
  ): Promise<void> {
    const stale: string[] = [];
    res.responses.forEach((r, idx) => {
      const code = r.error?.code;
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token'
      ) {
        stale.push(tokens[idx]);
      }
    });
    await this.deviceTokens.removeMany(stale);
  }
}
