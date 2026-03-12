import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/user/models/user.model';

@Table({
  tableName: 'user_streaks',
  timestamps: true,
})
export class UserStreak extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @ApiProperty({ description: 'Current streak count in days' })
  @Default(0)
  @Column(DataType.INTEGER)
  currentStreak: number;

  @ApiProperty({ description: 'Highest streak count achieved' })
  @Default(0)
  @Column(DataType.INTEGER)
  highestStreak: number;

  @ApiProperty({ description: 'Number of grace days used in the current week' })
  @Default(0)
  @Column(DataType.INTEGER)
  graceDaysUsedThisWeek: number;

  @ApiProperty({
    description: 'The last date the streak trigger was fulfilled',
  })
  @Column(DataType.DATEONLY)
  lastStreakDate: string;

  @BelongsTo(() => User)
  user: User;
}

@Table({
  tableName: 'user_streak_logs',
  timestamps: true,
})
export class UserStreakLog extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @ApiProperty({ description: 'Date of the streak log' })
  @Column(DataType.DATEONLY)
  date: string;

  @ApiProperty({
    description: 'Status of the streak on this date',
    enum: ['ACTIVE', 'GRACE_DAY', 'LOST'],
  })
  @Column(DataType.ENUM('ACTIVE', 'GRACE_DAY', 'LOST'))
  status: 'ACTIVE' | 'GRACE_DAY' | 'LOST';

  @ApiProperty({ description: 'The streak count at the time of this log' })
  @Default(0)
  @Column(DataType.INTEGER)
  streakCount: number;

  @BelongsTo(() => User)
  user: User;
}
