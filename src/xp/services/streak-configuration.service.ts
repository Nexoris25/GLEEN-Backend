import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StreakConfiguration, StreakMilestoneReward } from '../models/streak-configuration.model';
import { UpdateStreakConfigurationDto } from '../dto/update-streak-configuration.dto';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class StreakConfigurationService {
  constructor(
    @InjectModel(StreakConfiguration)
    private readonly streakConfigRepository: typeof StreakConfiguration,
    @InjectModel(StreakMilestoneReward)
    private readonly milestoneRewardRepository: typeof StreakMilestoneReward,
    private readonly sequelize: Sequelize,
  ) {}

  async findOne(): Promise<{ configuration: StreakConfiguration; milestones: StreakMilestoneReward[] }> {
    let configuration = await this.streakConfigRepository.findOne();
    if (!configuration) {
      configuration = await this.initializeDefaultConfiguration();
    }
    const milestones = await this.milestoneRewardRepository.findAll({ order: [['dayCount', 'ASC']] });
    return { configuration, milestones };
  }

  async update(updateDto: UpdateStreakConfigurationDto): Promise<{ configuration: StreakConfiguration; milestones: StreakMilestoneReward[] }> {
    const { milestoneRewards, ...configData } = updateDto;

    return await this.sequelize.transaction(async (t) => {
      let configuration = await this.streakConfigRepository.findOne({ transaction: t });
      if (!configuration) {
        configuration = await this.streakConfigRepository.create({ ...configData } as any, { transaction: t });
      } else {
        await configuration.update(configData, { transaction: t });
      }

      if (milestoneRewards) {
        // Simple approach: delete and recreate milestones or update existing ones
        // Here we'll clear and recreate to match the provided list exactly
        await this.milestoneRewardRepository.destroy({ where: {}, transaction: t });
        await this.milestoneRewardRepository.bulkCreate(
          milestoneRewards.map(m => ({
            dayCount: m.dayCount,
            xpReward: m.xpReward,
            badgeReward: m.badgeReward || 'None',
          })),
          { transaction: t }
        );
      }

      const milestones = await this.milestoneRewardRepository.findAll({ 
        order: [['dayCount', 'ASC']],
        transaction: t 
      });
      return { configuration, milestones };
    });
  }

  private async initializeDefaultConfiguration(): Promise<StreakConfiguration> {
    const config = await this.streakConfigRepository.create({
      streakCountTrigger: 1,
      timeWindowStart: '00:00',
      timeWindowEnd: '23:59',
      graceDaysPerWeek: 1,
      streakFreezeRule: '1 in 7 complete days',
      streakPauseRule: 'During holiday',
    } as any);

    const defaultMilestones = [
      { dayCount: 7, xpReward: 50, badgeReward: 'None' },
      { dayCount: 14, xpReward: 100, badgeReward: 'Bronze badge' },
      { dayCount: 30, xpReward: 300, badgeReward: 'Silver badge' },
      { dayCount: 90, xpReward: 1000, badgeReward: 'Golden badge' },
    ];

    await this.milestoneRewardRepository.bulkCreate(defaultMilestones);

    return config;
  }
}
