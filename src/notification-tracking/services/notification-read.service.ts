// src/notifications/services/notification-read.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NotificationTracking } from '../models/notification-recipient.model';
import { NotificationEntityType } from 'src/shared-types/FileTypeEnum';

import { AggregatedNotificationDto } from '../dto/aggregated-notification.dto';
import { V1Battle } from 'src/v1-battle/models/v1-battle.model';
import { TutorMessage } from 'src/messages/models/tutor-message.model';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

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
    const existing = await this.recipientModel.findOne({
      where: { userId, entityType, entityId },
    });

    if (existing) {
      if (!existing.read) {
        await existing.update({ read: true, readAt: new Date() });
      }
      return;
    }

    try {
      await this.recipientModel.create({
        id: uuidv4(),
        userId,
        entityType,
        entityId,
        read: true,
        readAt: new Date(),
      } as any);
    } catch (err: any) {
      // Concurrent request already created the row — find it and update.
      if (err.name === 'SequelizeUniqueConstraintError') {
        const race = await this.recipientModel.findOne({
          where: { userId, entityType, entityId },
        });
        if (race && !race.read) {
          await race.update({ read: true, readAt: new Date() });
        }
        return;
      }
      throw err;
    }
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
      read: false, // default to unread
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
