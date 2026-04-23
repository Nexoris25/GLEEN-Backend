import {
  Controller,
  Put,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import stringify from 'safe-stable-stringify';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { NotificationSettingsService } from '../services/notification-settings.service';
import { CreateNotificationSettingsDto } from '../dto/create-notification-settings.dto';
import { UpdateNotificationSettingsDto } from '../dto/update-notification-settings.dto';
import { NotificationSettings } from '../models/notification-settings.model';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';

@ApiTags('Notification Settings')
@Controller('notification-settings')
@UseGuards(JwtAuthGuard)
export class NotificationSettingsController {
  constructor(
    private readonly notificationSettingsService: NotificationSettingsService,
  ) {}

  @Put()
  @ApiOperation({ summary: 'Create or update notification settings' })
  @ApiBody({ type: CreateNotificationSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Notification settings saved',
    type: NotificationSettings,
  })
  @ApiResponse({
    status: 400,
    description: 'Error saving notification settings',
  })
  async upsert(
    @Body() dto: CreateNotificationSettingsDto,
    @UserId() userId: string,
  ) {
    try {
      const settings = await this.notificationSettingsService.create(
        dto,
        userId,
      );
      return {
        status: HttpStatus.OK,
        message: 'Notification settings saved successfully',
        data: settings,
      };
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error saving notification settings',
        error: stringify({ message: error.message, ...error }),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all notification settings' })
  @ApiResponse({
    status: 200,
    description: 'Notification settings retrieved',
    type: [NotificationSettings],
  })
  async findAll() {
    try {
      const settings = await this.notificationSettingsService.findAll();
      return {
        status: HttpStatus.OK,
        message: 'Notification settings retrieved successfully',
        data: settings,
      };
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error fetching notification settings',
        error: stringify({ message: error.message, ...error }),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification settings by id' })
  @ApiParam({ name: 'id', description: 'NotificationSettings ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification settings retrieved',
    type: NotificationSettings,
  })
  @ApiResponse({ status: 404, description: 'Notification settings not found' })
  async findOne(@Param('id') id: string) {
    try {
      const settings = await this.notificationSettingsService.findOne(id);
      return {
        status: HttpStatus.OK,
        message: 'Notification settings retrieved successfully',
        data: settings,
      };
    } catch (error) {
      const status = error.status || HttpStatus.BAD_REQUEST;
      return {
        status,
        message: error.message || 'Error retrieving notification settings',
        error: stringify({ message: error.message, ...error }),
      };
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get notification settings by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification settings retrieved',
    type: NotificationSettings,
  })
  @ApiResponse({ status: 404, description: 'Notification settings not found' })
  async findOneByUserId(@Param('userId') userId: string) {
    try {
      const settings =
        await this.notificationSettingsService.findByUserId(userId);
      return {
        status: HttpStatus.OK,
        message: 'Notification settings retrieved successfully',
        data: settings,
      };
    } catch (error) {
      const status = error.status || HttpStatus.BAD_REQUEST;
      return {
        status,
        message: error.message || 'Error retrieving notification settings',
        error: stringify({ message: error.message, ...error }),
      };
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification settings by id' })
  @ApiParam({ name: 'id', description: 'NotificationSettings ID' })
  @ApiBody({ type: UpdateNotificationSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Notification settings updated',
    type: NotificationSettings,
  })
  @ApiResponse({
    status: 400,
    description: 'Error updating notification settings',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    try {
      const settings = await this.notificationSettingsService.update(id, dto);
      return {
        status: HttpStatus.OK,
        message: 'Notification settings updated successfully',
        data: settings,
      };
    } catch (error) {
      const status = error.status || HttpStatus.BAD_REQUEST;
      return {
        status,
        message: error.message || 'Error updating notification settings',
        error: stringify({ message: error.message, ...error }),
      };
    }
  }

  @Patch('user/:userId')
  @ApiOperation({ summary: 'Update notification settings by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiBody({ type: UpdateNotificationSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Notification settings updated',
    type: NotificationSettings,
  })
  @ApiResponse({
    status: 400,
    description: 'Error updating notification settings',
  })
  async updateByUserId(
    @Param('userId') userId: string,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    try {
      const settings = await this.notificationSettingsService.updateByUserId(
        userId,
        dto,
      );
      return {
        status: HttpStatus.OK,
        message: 'Notification settings updated successfully',
        data: settings,
      };
    } catch (error) {
      const status = error.status || HttpStatus.BAD_REQUEST;
      return {
        status,
        message: error.message || 'Error updating notification settings',
        error: stringify({ message: error.message, ...error }),
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification settings by id' })
  @ApiParam({ name: 'id', description: 'NotificationSettings ID' })
  @ApiResponse({ status: 200, description: 'Notification settings deleted' })
  @ApiResponse({ status: 404, description: 'Notification settings not found' })
  async remove(@Param('id') id: string) {
    try {
      await this.notificationSettingsService.remove(id);
      return {
        status: HttpStatus.OK,
        message: 'Notification settings deleted successfully',
      };
    } catch (error) {
      const status = error.status || HttpStatus.BAD_REQUEST;
      return {
        status,
        message: error.message || 'Error deleting notification settings',
        error: stringify({ message: error.message, ...error }),
      };
    }
  }
}
