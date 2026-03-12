import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  StreakConfiguration,
  StreakMilestoneReward,
} from '../models/streak-configuration.model';
import { UserStreak, UserStreakLog } from '../models/user-streak.model';
import { UpdateStreakConfigurationDto } from '../dto/update-streak-configuration.dto';
import { Sequelize } from 'sequelize-typescript';
import { Op, fn, col } from 'sequelize';
import { XpStatisticsQueryDto } from '../dto/xp-statistics.dto';

@Injectable()
export class StreakConfigurationService {
  constructor(
    @InjectModel(StreakConfiguration)
    private readonly streakConfigRepository: typeof StreakConfiguration,
    @InjectModel(StreakMilestoneReward)
    private readonly milestoneRewardRepository: typeof StreakMilestoneReward,
    @InjectModel(UserStreak)
    private readonly userStreakRepository: typeof UserStreak,
    @InjectModel(UserStreakLog)
    private readonly userStreakLogRepository: typeof UserStreakLog,
    private readonly sequelize: Sequelize,
  ) {}

  async getStreakAnalytics(query: XpStatisticsQueryDto) {
    const { startDate, endDate } = query;
    const whereClause: any = {};
    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) {
        dateFilter[Op.gte] = startDate;
      }
      if (endDate) {
        dateFilter[Op.lte] = endDate;
      }
      whereClause['date'] = dateFilter;
    }

    // 1. Highest streak count in days
    const highestStreak =
      (await this.userStreakRepository.max('highestStreak')) || 0;

    // 2. Grace day usage
    const graceDayUsage = await this.userStreakLogRepository.count({
      where: { ...whereClause, status: 'GRACE_DAY' },
    });

    // 3. Total streak days lost (Sum of all lost streaks)
    const streakLossHeatmap =
      (await this.userStreakLogRepository.sum('streakCount', {
        where: { ...whereClause, status: 'LOST' },
      })) || 0;

    // 4. Retention count graph data (Y: Streak count, X: Time)
    // We'll calculate the total streak count of active/grace users on each day
    const retentionGraphDataRaw = await this.userStreakLogRepository.findAll({
      attributes: ['date', [fn('SUM', col('streakCount')), 'totalStreak']],
      where: {
        ...whereClause,
        status: { [Op.in]: ['ACTIVE', 'GRACE_DAY'] },
      },
      group: ['date'],
      order: [['date', 'ASC']],
      raw: true,
    });

    const retentionGraphData = (retentionGraphDataRaw as any).map(
      (item: { date: string; totalStreak: string }) => ({
        date: String(item.date),
        streakCount: parseFloat(String(item.totalStreak)) || 0,
      }),
    );

    return {
      highestStreak,
      graceDayUsage,
      streakLossHeatmap: parseInt(String(streakLossHeatmap), 10) || 0,
      retentionGraphData,
    };
  }

  async findOne(): Promise<{
    configuration: StreakConfiguration;
    milestones: StreakMilestoneReward[];
  }> {
    let configuration = await this.streakConfigRepository.findOne();
    if (!configuration) {
      configuration = await this.initializeDefaultConfiguration();
    }
    const milestones = await this.milestoneRewardRepository.findAll({
      order: [['dayCount', 'ASC']],
    });
    return { configuration, milestones };
  }

  async update(updateDto: UpdateStreakConfigurationDto): Promise<{
    configuration: StreakConfiguration;
    milestones: StreakMilestoneReward[];
  }> {
    const { milestoneRewards, ...configData } = updateDto;

    return await this.sequelize.transaction(async (t) => {
      let configuration = await this.streakConfigRepository.findOne({
        transaction: t,
      });
      if (!configuration) {
        configuration = await this.streakConfigRepository.create(
          { ...configData } as any,
          { transaction: t },
        );
      } else {
        await configuration.update(configData, { transaction: t });
      }

      if (milestoneRewards) {
        // Simple approach: delete and recreate milestones or update existing ones
        // Here we'll clear and recreate to match the provided list exactly
        await this.milestoneRewardRepository.destroy({
          where: {},
          transaction: t,
        });
        await this.milestoneRewardRepository.bulkCreate(
          milestoneRewards.map((m) => ({
            dayCount: m.dayCount,
            xpReward: m.xpReward,
            badgeReward: m.badgeReward || 'None',
          })),
          { transaction: t },
        );
      }

      const milestones = await this.milestoneRewardRepository.findAll({
        order: [['dayCount', 'ASC']],
        transaction: t,
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
