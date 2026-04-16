// src/notifications/models/notification-recipient.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  PrimaryKey,
  ForeignKey,
  Index,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/models/user.model';
import { NotificationEntityType } from 'src/shared-types/FileTypeEnum';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: 'notification_tracking',
  timestamps: true,
  indexes: [
    {
      name: 'uniq_notification_per_user',
      unique: true,
      fields: ['entityType', 'entityId', 'userId'],
    },
  ],
})
export class NotificationTracking extends Model {
  @ApiProperty()
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  id: string;

  // What this notification refers to
  @ApiProperty({ enum: NotificationEntityType })
  @Index
  @Column({
    type: DataType.ENUM(
      NotificationEntityType.TUTOR_MESSAGE,
      NotificationEntityType.V1_BATTLE_INVITE,
      NotificationEntityType.SYSTEM,
    ),
    allowNull: false,
  })
  entityType: NotificationEntityType;

  // ID of the referenced entity (message, battle, etc.)
  @ApiProperty()
  @Index
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  entityId: string;

  // Recipient
  @ApiProperty()
  @ForeignKey(() => User)
  @Index
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  // Read tracking
  @ApiProperty({ default: false })
  @Default(false)
  @Column(DataType.BOOLEAN)
  read: boolean;

  @ApiProperty({ required: false })
  @Column(DataType.DATE)
  readAt?: Date;
}
