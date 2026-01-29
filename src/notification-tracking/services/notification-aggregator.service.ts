// src/notifications/services/notification-aggregator.service.ts
import { Injectable } from '@nestjs/common';
import { NotificationReadService } from './notification-read.service';
import { NotificationEntityType } from 'src/shared-types/FileTypeEnum';
import { AggregatedNotificationDto } from '../dto/aggregated-notification.dto';
import { V1Battle } from 'src/v1-battle/models/v1-battle.model';
import { TutorMessage } from 'src/messages/models/tutor-message.model';
import { Op } from 'sequelize';

@Injectable()
export class NotificationAggregatorService {
  constructor(
    private readonly readService: NotificationReadService,
  ) {}

  async getUserNotifications(userId: string): Promise<AggregatedNotificationDto[]> {
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
     * SORT (latest first)
     * ----------------------------
     */
    return notifications.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }
}
