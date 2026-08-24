// src/notifications/controllers/notification-read.controller.ts
import { Controller, Get, Param, Patch, UseGuards, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { NotificationReadService } from '../services/notification-read.service';
import { NotificationEntityType } from 'src/shared-types/FileTypeEnum';
import { NotificationAggregatorService } from '../services/notification-aggregator.service';
import { AggregatedNotificationDto } from '../dto/aggregated-notification.dto';

@ApiTags('Notification-Tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notification-tracking')
export class NotificationTrackingController {
  constructor(
    private readonly service: NotificationReadService,
    private readonly serviceAggregator: NotificationAggregatorService,
  ) {}

  @Get(':entityType/:entityId/read')
  async hasRead(
    @Param('entityType') entityType: NotificationEntityType,
    @Param('entityId') entityId: string,
    @UserId() userId: string,
  ) {
    return {
      read: await this.service.hasRead(userId, entityType, entityId),
    };
  }

  @Patch(':entityType/:entityId/read')
  async markAsRead(
    @Param('entityType') entityType: NotificationEntityType,
    @Param('entityId') entityId: string,
    @UserId() userId: string,
  ) {
    try {
      await this.service.markAsRead(userId, entityType, entityId);
      return { success: true };
    } catch (err: any) {
      console.error('markAsRead failed:', err.message, { userId, entityType, entityId });
      return { success: false, status: HttpStatus.INTERNAL_SERVER_ERROR, message: err.message };
    }
  }

  @ApiOkResponse({ type: AggregatedNotificationDto, isArray: true })
  @Get()
  @ApiOperation({ summary: 'Get all notifications for logged-in user' })
  async list(@UserId() userId: string) {
    return this.serviceAggregator.getUserNotifications(userId);
  }
}
