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
  tableName: 'leaderboard_rank_rewards',
  timestamps: true,
})
export class LeaderboardRankReward extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty({ description: 'The rank or percentile (e.g., 1st place, Top 1%)' })
  @Column(DataType.STRING)
  rank: string;

  @ApiProperty({ description: 'XP reward for this rank' })
  @Column(DataType.DOUBLE)
  xpReward: number;

  @ApiProperty({ description: 'Badge or icon reward for this rank' })
  @Column(DataType.STRING)
  badgeReward: string;

  @ApiProperty({ description: 'Order of display or evaluation priority' })
  @Column(DataType.INTEGER)
  order: number;
}
