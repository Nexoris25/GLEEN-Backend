// src/messages/models/tutor-message.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { NotificationTracking } from 'src/notification-tracking/models/notification-recipient.model';

@Table({
  tableName: 'tutor_messages',
  timestamps: true,
})
export class TutorMessage extends Model {
  @ApiProperty()
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  id: string;

  @ApiProperty({ description: 'Tutor sending the message' })
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  tutorId: string;

  @ApiProperty()
  @Column(DataType.STRING)
  title: string;

  @ApiProperty()
  @Column(DataType.TEXT)
  message: string;

  // targeting flags
  @ApiProperty({ default: false })
  @Default(false)
  @Column(DataType.BOOLEAN)
  sendToAll: boolean;

  // targeting flags
  @ApiProperty({ default: false })
  @Default(false)
  @Column(DataType.BOOLEAN)
  mailSent: boolean;

  // Targeting is stored as arrays so a single message can fan out across
  // multiple states / subjects / classes / individual students at once.
  @ApiProperty({ required: false, type: [String] })
  @Column(DataType.ARRAY(DataType.UUID))
  stateIds?: string[];

  @ApiProperty({ required: false, type: [String] })
  @Column(DataType.ARRAY(DataType.UUID))
  subjectIds?: string[];

  @ApiProperty({ required: false, type: [String] })
  @Column(DataType.ARRAY(DataType.UUID))
  classIds?: string[];

  @ApiProperty({ required: false, type: [String] })
  @Column(DataType.ARRAY(DataType.UUID))
  studentIds?: string[];

  @BelongsTo(() => User, 'tutorId')
  tutor: User;

  @HasMany(() => NotificationTracking, {
    foreignKey: 'entityId',
    scope: {
      entityType: 'TUTOR_MESSAGE',
    },
    as: 'recipients',
  })
  recipients: NotificationTracking[];
}
