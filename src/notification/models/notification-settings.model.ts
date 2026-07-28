import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  IsUUID,
  ForeignKey,
  Unique,
  BeforeCreate,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/user/models/user.model';

@Table({ tableName: 'notification_settings', timestamps: true })
export class NotificationSettings extends Model<NotificationSettings> {
  @ApiProperty({
    description: 'Unique identifier for the notification settings',
    type: String,
    format: 'uuid',
  })
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty({ description: 'User notification settings', type: Boolean })
  @Column({ type: DataType.BOOLEAN })
  userNotification: boolean;

  @ApiProperty({ description: 'Email notification settings', type: Boolean })
  @Column({ type: DataType.BOOLEAN })
  emailNotification: boolean;

  @ApiProperty()
  @ForeignKey(() => User)
  @Unique(true)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @ApiProperty({ description: 'app notification settings', type: Boolean })
  @Column({ type: DataType.BOOLEAN })
  appNotification: boolean;

  @ApiProperty({ description: 'Push notification settings', type: Boolean })
  @Column({ type: DataType.BOOLEAN })
  pushNotification: boolean;

  @ApiProperty({ description: 'Push notification settings', type: Boolean })
  @Column({ type: DataType.BOOLEAN })
  soundNotification: boolean;

  @ApiProperty({
    description: 'Alerts for new messages from peers',
    type: Boolean,
  })
  @Default(true)
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  newMessages: boolean;

  @ApiProperty({
    description: 'Updates on crew activities and announcements',
    type: Boolean,
  })
  @Default(true)
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  crewUpdates: boolean;

  @ApiProperty({
    description: 'New features, updates and improvements to the app',
    type: Boolean,
  })
  @Default(true)
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  appUpdates: boolean;

  @ApiProperty({
    description:
      'Weekly email/SMS updates for usage time, quiz scores, and missed streaks',
    type: Boolean,
  })
  @Default(true)
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  parentsReporting: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    type: String,
    format: 'date-time',
  })
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: String,
    format: 'date-time',
  })
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  updatedAt: Date;

  @BeforeCreate
  static async setUserId(
    instance: NotificationSettings,
    options: { [key: string]: any },
  ) {
    // Retrieve the authenticated user ID
    const authUserId = options.userId;
    if (!authUserId) {
      throw new Error('Authenticated user ID is not available');
    }
    instance.userId = authUserId;
  }
}
