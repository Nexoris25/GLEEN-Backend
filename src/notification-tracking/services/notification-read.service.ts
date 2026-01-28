// src/notifications/services/notification-read.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NotificationTracking } from '../models/notification-recipient.model';
import { NotificationEntityType } from 'src/shared-types/FileTypeEnum';


import { AggregatedNotificationDto } from '../dto/aggregated-notification.dto';
import { V1Battle } from 'src/v1-battle/models/v1-battle.model';
import { TutorMessage } from 'src/messages/models/tutor-message.model';
import { Op } from 'sequelize';

@Injectable()
export class NotificationReadService {
  constructor(
    @InjectModel(NotificationTracking)
    private readonly recipientModel: typeof NotificationTracking,
  ) {}

  /**
   * Check if a user has read a specific entity notification
   */
  async hasRead(
    userId: string,
    entityType: NotificationEntityType,
    entityId: string,
  ): Promise<boolean> {
    const record = await this.recipientModel.findOne({
      where: {
        userId,
        entityType,
        entityId,
      },
      attributes: ['read'],
    });

    return record ? record.read === true : false;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    userId: string,
    entityType: NotificationEntityType,
    entityId: string,
  ): Promise<void> {
    await this.recipientModel.update(
      {
        read: true,
        readAt: new Date(),
      },
      {
        where: {
          userId,
          entityType,
          entityId,
        },
      },
    );
  }


  /**
 * Create a notification for a user
 * Defaults to unread (read: false)
 */
async createNotification(
  userId: string,
  entityType: NotificationEntityType,
  entityId: string,
): Promise<NotificationTracking> {
  return this.recipientModel.create({
    userId,
    entityType,
    entityId,
    read: false,  // default to unread
  });
}

  /**
   * Get all unread notifications for a user (optional helper)
   */
  async getUnread(userId: string) {
    return this.recipientModel.findAll({
      where: {
        userId,
        read: false,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Count unread notifications (fast badge count)
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.recipientModel.count({
      where: {
        userId,
        read: false,
      },
    });
  }


  
}
