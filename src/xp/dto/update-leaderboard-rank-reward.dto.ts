import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRankRewardDto {
  @ApiProperty({ description: 'The rank or percentile (e.g., 1st place, Top 1%)' })
  @IsString()
  rank: string;

  @ApiProperty({ description: 'XP reward for this rank' })
  @IsNumber()
  xpReward: number;

  @ApiProperty({ description: 'Badge or icon reward for this rank' })
  @IsString()
  badgeReward: string;
}

export class BulkUpdateRankRewardsDto {
  @ApiProperty({ type: [UpdateRankRewardDto], description: 'List of rank rewards' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRankRewardDto)
  rewards: UpdateRankRewardDto[];
}
