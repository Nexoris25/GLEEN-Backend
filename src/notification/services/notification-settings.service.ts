import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NotificationSettings } from '../models/notification-settings.model';
import { CreateNotificationSettingsDto } from '../dto/create-notification-settings.dto';
import { UpdateNotificationSettingsDto } from '../dto/update-notification-settings.dto';
import stringify from 'safe-stable-stringify';

@Injectable()
export class NotificationSettingsService {
  constructor(@InjectModel(NotificationSettings) private readonly notificationSettingsModel: typeof NotificationSettings) {}

  async create(createDto: CreateNotificationSettingsDto, userId: string): Promise<NotificationSettings> {
    try {
      const settings = await this.notificationSettingsModel.create({ ...createDto, userId }, { isNewRecord: true, userId });
      return settings;
    } catch (err) {
      throw new BadRequestException({ message: 'Error creating notification settings', details: stringify(err) });
    }
  }

  async findAll(): Promise<NotificationSettings[]> {
    return this.notificationSettingsModel.findAll();
  }

    async findByUserId(userId: string): Promise<NotificationSettings | null> {
    return this.notificationSettingsModel.findOne({ where: { userId } });
  }

  async updateByUserId(userId: string, updateDto: UpdateNotificationSettingsDto): Promise<NotificationSettings> {
    const settings = await this.findByUserId(userId);
    if (!settings) throw new NotFoundException(`NotificationSettings for userId ${userId} not found`);
    try {
      return await settings.update(updateDto as any);
    } catch (err) {
      throw new BadRequestException({ message: 'Error updating notification settings', details: stringify(err) });
    }
  }
  async findOne(id: string): Promise<NotificationSettings> {
    const settings = await this.notificationSettingsModel.findByPk(id);
    if (!settings) throw new NotFoundException(`NotificationSettings with id ${id} not found`);
    return settings;
  }

  async update(id: string, updateDto: UpdateNotificationSettingsDto): Promise<NotificationSettings> {
    const settings = await this.findOne(id);
    try {
      return await settings.update(updateDto as any);
    } catch (err) {
      throw new BadRequestException({ message: 'Error updating notification settings', details: stringify(err) });
    }
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.notificationSettingsModel.destroy({ where: { id } });
    if (!deleted) throw new NotFoundException(`NotificationSettings with id ${id} not found`);
  }
}