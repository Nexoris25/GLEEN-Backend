// src/notifications/services/notification-aggregator.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NotificationReadService } from './notification-read.service';
import { NotificationEntityType } from 'src/shared-types/FileTypeEnum';
import { AggregatedNotificationDto } from '../dto/aggregated-notification.dto';
import { V1Battle } from 'src/v1-battle/models/v1-battle.model';
import { TutorMessage } from 'src/messages/models/tutor-message.model';
import {
  XpWithdrawalRequest,
  WithdrawalStatus,
} from 'src/xp-withdrawal/models/xp-withdrawal-request.model';
import { User } from 'src/user/models/user.model';
import { Op } from 'sequelize';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

@Injectable()
export class NotificationAggregatorService {
  constructor(
    private readonly readService: NotificationReadService,
    @InjectModel(XpWithdrawalRequest)
    private readonly withdrawalModel: typeof XpWithdrawalRequest,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async getUserNotifications(
    userId: string,
  ): Promise<AggregatedNotificationDto[]> {
    const notifications: AggregatedNotificationDto[] = [];

    /**
     * ----------------------------
     * V1 BATTLE INVITES
     * ----------------------------
     */
    const battles = await V1Battle.findAll({
      where: {
        opponentUserId: userId,
      },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    for (const battle of battles) {
      const read = await this.readService.hasRead(
        userId,
        NotificationEntityType.V1_BATTLE_INVITE,
        battle.id,
      );

      notifications.push({
        id: battle.id,
        type: NotificationEntityType.V1_BATTLE_INVITE,
        title: 'New Battle Invite',
        message: 'You have been invited to a 1v1 battle',
        createdAt: battle.createdAt,
        read,
        data: {
          subjectId: battle.subjectId,
          quizId: battle.quizId,
        },
      });
    }

    /**
     * ----------------------------
     * TUTOR MESSAGES
     * ----------------------------
     */
    const tutorMessages = await TutorMessage.findAll({
      where: {
        [Op.or]: [
          { sendToAll: true }, // messages sent to all students
        ],
      },
      include: [
        {
          association: 'recipients',
          where: { userId },
          required: false, // include even if no recipient row exists
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    for (const msg of tutorMessages) {
      const read = await this.readService.hasRead(
        userId,
        NotificationEntityType.TUTOR_MESSAGE,
        msg.id,
      );

      notifications.push({
        id: msg.id,
        type: NotificationEntityType.TUTOR_MESSAGE,
        title: 'Message from Tutor',
        message: msg.title ?? 'New tutor message',
        createdAt: msg.createdAt,
        read,
      });
    }

    /**
     * ----------------------------
     * XP WITHDRAWALS — the user's own approved/declined requests.
     * Tracked under SYSTEM (the recipient table's enum has no withdrawal
     * value); the specific kind lives in title/message/data.
     * ----------------------------
     */
    const myWithdrawals = await this.withdrawalModel.findAll({
      where: {
        userId,
        status: {
          [Op.in]: [WithdrawalStatus.SENT, WithdrawalStatus.DECLINED],
        },
      },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    for (const w of myWithdrawals) {
      const sent = w.status === WithdrawalStatus.SENT;
      const read = await this.readService.hasRead(
        userId,
        NotificationEntityType.SYSTEM,
        w.id,
      );

      notifications.push({
        id: w.id,
        type: NotificationEntityType.SYSTEM,
        title: sent ? 'Withdrawal approved' : 'Withdrawal declined',
        message: sent
          ? `Your ₦${w.airtimeAmount} airtime to ${w.phone} is on its way.`
          : w.declineReason
            ? `Your withdrawal was declined: ${w.declineReason}. Your XP has been refunded.`
            : 'Your withdrawal was declined and your XP has been refunded.',
        createdAt: w.processedAt ?? w.createdAt,
        read,
        data: {
          kind: sent ? 'WITHDRAWAL_SENT' : 'WITHDRAWAL_DECLINED',
          requestId: w.id,
          amount: w.airtimeAmount,
          status: w.status,
        },
      });
    }

    /**
     * ----------------------------
     * XP WITHDRAWALS — admins get notified of incoming (pending) requests.
     * ----------------------------
     */
    const viewer = await this.userModel.findByPk(userId, {
      attributes: ['id', 'role'],
    });
    if (viewer && ADMIN_ROLES.includes(viewer.role)) {
      const pending = await this.withdrawalModel.findAll({
        where: { status: WithdrawalStatus.PENDING },
        include: ['user'],
        order: [['createdAt', 'DESC']],
        limit: 50,
      });

      for (const w of pending) {
        const read = await this.readService.hasRead(
          userId,
          NotificationEntityType.SYSTEM,
          w.id,
        );

        notifications.push({
          id: w.id,
          type: NotificationEntityType.SYSTEM,
          title: 'New withdrawal request',
          message: `${(w as any).user?.fullName ?? 'A student'} requested ₦${w.airtimeAmount} airtime (${w.network} · ${w.phone}).`,
          createdAt: w.createdAt,
          read,
          data: {
            kind: 'WITHDRAWAL_REQUEST',
            requestId: w.id,
            amount: w.airtimeAmount,
            requesterId: w.userId,
          },
        });
      }
    }

    /**
     * ----------------------------
     * SORT (latest first)
     * ----------------------------
     */
    return notifications.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }
}
