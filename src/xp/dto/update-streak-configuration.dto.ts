import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMilestoneRewardDto {
  @ApiProperty({ description: 'Milestone ID (if existing)' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Number of days for the milestone' })
  @IsNumber()
  dayCount: number;

  @ApiProperty({ description: 'XP reward for reaching this milestone' })
  @IsNumber()
  xpReward: number;

  @ApiProperty({ description: 'Badge reward for reaching this milestone' })
  @IsString()
  @IsOptional()
  badgeReward?: string;
}

export class UpdateStreakConfigurationDto {
  @ApiPropertyOptional({
    description: 'Number of lessons required to trigger a streak count',
  })
  @IsNumber()
  @IsOptional()
  streakCountTrigger?: number;

  @ApiPropertyOptional({ description: 'Start of the time window for streak' })
  @IsString()
  @IsOptional()
  timeWindowStart?: string;

  @ApiPropertyOptional({ description: 'End of the time window for streak' })
  @IsString()
  @IsOptional()
  timeWindowEnd?: string;

  @ApiPropertyOptional({ description: 'Number of grace days allowed per week' })
  @IsNumber()
  @IsOptional()
  graceDaysPerWeek?: number;

  @ApiPropertyOptional({ description: 'Streak freeze rule' })
  @IsString()
  @IsOptional()
  streakFreezeRule?: string;

  @ApiPropertyOptional({ description: 'Streak pause rule' })
  @IsString()
  @IsOptional()
  streakPauseRule?: string;

  @ApiPropertyOptional({
    type: [UpdateMilestoneRewardDto],
    description: 'List of milestone rewards',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMilestoneRewardDto)
  @IsOptional()
  milestoneRewards?: UpdateMilestoneRewardDto[];
}
