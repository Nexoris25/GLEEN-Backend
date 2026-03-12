import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: 'streak_configuration',
  timestamps: true,
})
export class StreakConfiguration extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty({ description: 'Number of lessons required to trigger a streak count' })
  @Column(DataType.INTEGER)
  streakCountTrigger: number;

  @ApiProperty({ description: 'Start of the time window for streak (e.g., 00:00)' })
  @Column(DataType.STRING)
  timeWindowStart: string;

  @ApiProperty({ description: 'End of the time window for streak (e.g., 23:59)' })
  @Column(DataType.STRING)
  timeWindowEnd: string;

  @ApiProperty({ description: 'Number of grace days allowed per week' })
  @Column(DataType.INTEGER)
  graceDaysPerWeek: number;

  @ApiProperty({ description: 'Streak freeze rule (e.g., 1 in 7 complete days)' })
  @Column(DataType.STRING)
  streakFreezeRule: string;

  @ApiProperty({ description: 'Streak pause rule (e.g., during holiday)' })
  @Column(DataType.STRING)
  streakPauseRule: string;
}

@Table({
  tableName: 'streak_milestone_rewards',
  timestamps: true,
})
export class StreakMilestoneReward extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty({ description: 'Number of days for the milestone' })
  @Column(DataType.INTEGER)
  dayCount: number;

  @ApiProperty({ description: 'XP reward for reaching this milestone' })
  @Column(DataType.DOUBLE)
  xpReward: number;

  @ApiProperty({ description: 'Badge reward for reaching this milestone' })
  @Column(DataType.STRING)
  badgeReward: string;
}
