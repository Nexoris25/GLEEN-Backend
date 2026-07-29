import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { DeviceToken } from '../models/device-token.model';

@Injectable()
export class DeviceTokenService {
  constructor(
    @InjectModel(DeviceToken)
    private readonly deviceTokenModel: typeof DeviceToken,
  ) {}

  /**
   * Idempotently attach a token to a user. The same physical device reuses one
   * FCM token; if it was previously registered (even to another user after a
   * logout/login), we just re-point it — never create duplicates.
   */
  async register(userId: string, token: string, platform?: string | null) {
    const existing = await this.deviceTokenModel.findOne({ where: { token } });
    if (existing) {
      if (existing.userId !== userId || existing.platform !== (platform ?? null)) {
        await existing.update({ userId, platform: platform ?? null });
      }
      return existing;
    }
    return this.deviceTokenModel.create({
      userId,
      token,
      platform: platform ?? null,
    } as any);
  }

  /** Remove a token (on logout / account deletion). */
  async remove(token: string) {
    await this.deviceTokenModel.destroy({ where: { token } });
  }

  /** Drop tokens FCM reported as no longer valid. */
  async removeMany(tokens: string[]) {
    if (!tokens.length) return;
    await this.deviceTokenModel.destroy({ where: { token: { [Op.in]: tokens } } });
  }

  async tokensForUsers(userIds: string[]): Promise<string[]> {
    if (!userIds.length) return [];
    const rows = await this.deviceTokenModel.findAll({
      where: { userId: { [Op.in]: userIds } },
      attributes: ['token'],
    });
    return rows.map((r) => r.token);
  }
}
