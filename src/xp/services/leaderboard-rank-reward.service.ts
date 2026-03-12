import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LeaderboardRankReward } from '../models/leaderboard-rank-reward.model';
import { BulkUpdateRankRewardsDto } from '../dto/update-leaderboard-rank-reward.dto';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class LeaderboardRankRewardService {
  constructor(
    @InjectModel(LeaderboardRankReward)
    private readonly rankRewardRepository: typeof LeaderboardRankReward,
    private readonly sequelize: Sequelize,
  ) {}

  async findAll(): Promise<LeaderboardRankReward[]> {
    let rewards = await this.rankRewardRepository.findAll({ order: [['order', 'ASC']] });
    if (rewards.length === 0) {
      rewards = await this.initializeDefaultRewards();
    }
    return rewards;
  }

  async updateAll(updateDto: BulkUpdateRankRewardsDto): Promise<LeaderboardRankReward[]> {
    return await this.sequelize.transaction(async (t) => {
      // Clear existing rewards and recreate to maintain the new list exactly
      await this.rankRewardRepository.destroy({ where: {}, transaction: t });
      
      const rewardsToCreate = updateDto.rewards.map((r, index) => ({
        rank: r.rank,
        xpReward: r.xpReward,
        badgeReward: r.badgeReward,
        order: index,
      }));

      await this.rankRewardRepository.bulkCreate(rewardsToCreate, { transaction: t });
      
      return await this.rankRewardRepository.findAll({ 
        order: [['order', 'ASC']],
        transaction: t 
      });
    });
  }

  private async initializeDefaultRewards(): Promise<LeaderboardRankReward[]> {
    const defaults = [
      { rank: '1st place', xpReward: 100, badgeReward: 'Crown icon', order: 0 },
      { rank: 'Top 1%', xpReward: 50, badgeReward: 'Elite', order: 1 },
      { rank: 'Top 10%', xpReward: 50, badgeReward: 'Achiever', order: 2 },
      { rank: 'Top 50%', xpReward: 50, badgeReward: 'Studious', order: 3 },
    ];

    return await this.rankRewardRepository.bulkCreate(defaults);
  }
}
