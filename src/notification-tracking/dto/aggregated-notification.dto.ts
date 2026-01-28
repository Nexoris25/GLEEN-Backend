import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationEntityType } from 'src/shared-types/FileTypeEnum';

export class AggregatedNotificationDto {
  @ApiProperty({
    description: 'Entity ID this notification refers to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    enum: NotificationEntityType,
    example: NotificationEntityType.TUTOR_MESSAGE,
    description: 'Type of notification',
  })
  type: NotificationEntityType;

  @ApiProperty({
    example: 'New tutor message',
  })
  title: string;

  @ApiProperty({
    example: 'You have received a new message from your tutor',
  })
  message: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-01-27T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: false,
  })
  read: boolean;

  @ApiPropertyOptional({
    type: Object,
    additionalProperties: true,
    example: { tutorId: 'uuid', lessonId: 'uuid' },
  })
  data?: Record<string, any>;
}
