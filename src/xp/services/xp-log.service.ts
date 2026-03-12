import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { XpLog } from '../models/xp-log.model';
import stringify from 'safe-stable-stringify';
import {
  CreateXpLogDto,
  UpdateXpLogDto,
  XpLogQueryDto,
} from '../dto/xp-log.dto';
import { XpRecordsService } from './xp-records.service';
import { XpConfiguration } from '../models/xp-configuration.model';
import { XpConfigurationService } from './xp-configuration.service';
import {
  XpRewardStoreAnalyticsResponseDto,
  XpStatisticsQueryDto,
  XpStatisticsResponseDto,
} from '../dto/xp-statistics.dto';
import { Sequelize } from 'sequelize-typescript';
import { Op, fn, col } from 'sequelize';

@Injectable()
export class XpLogService {
  constructor(
    @InjectModel(XpLog)
    private xpLogRepository: typeof XpLog,

    private xpRecordService: XpRecordsService,

    private xpConfiguationService: XpConfigurationService,

    private sequelize: Sequelize,
  ) {}

  async getXpStatistics(
    query: XpStatisticsQueryDto,
  ): Promise<XpStatisticsResponseDto> {
    try {
      const { startDate, endDate } = query;
      const whereClause: any = {};
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          (whereClause.createdAt as any)[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          (whereClause.createdAt as any)[Op.lte] = new Date(endDate);
        }
      }

      // 1. Total XP Issued
      const totalXpIssued =
        (await this.xpLogRepository.sum('xpValue', { where: whereClause })) ||
        0;

      // 2. Unique Users for Average Calculation
      const uniqueUsersCount = await this.xpLogRepository.count({
        distinct: true,
        col: 'userId',
        where: whereClause,
      });
      const averageXpPerUser =
        uniqueUsersCount > 0 ? totalXpIssued / uniqueUsersCount : 0;

      // 3. XP by Action (Grouping by xpType)
      const xpByActionRaw = await this.xpLogRepository.findAll({
        attributes: ['xpType', [fn('SUM', col('xpValue')), 'totalXp']],
        where: whereClause,
        group: ['xpType'],
        raw: true,
      });
      const xpByAction = xpByActionRaw.map((item: any) => ({
        action: String(item.xpType),
        totalXp: parseFloat(String(item.totalXp)),
      }));

      // 4. XP over time (Graph data)
      const xpOverTimeRaw = await this.xpLogRepository.findAll({
        attributes: [
          [fn('DATE', col('createdAt')), 'date'],
          [fn('SUM', col('xpValue')), 'dailyXp'],
        ],
        where: whereClause,
        group: [fn('DATE', col('createdAt'))],
        order: [[fn('DATE', col('createdAt')), 'ASC']],
        raw: true,
      });

      const xpOverTime = xpOverTimeRaw.map((item: any) => ({
        xp: parseFloat(String(item.dailyXp)),
        date: String(item.date),
      }));

      return {
        totalXpIssued,
        averageXpPerUser,
        xpByAction,
        xpOverTime,
      };
    } catch (error: any) {
      throw new Error(
        stringify({
          message: (error as Error).message,
          stack: (error as Error).stack,
          details: (error as any).response || error,
        }),
      );
    }
  }

  async getRewardStoreAnalytics(
    query: XpStatisticsQueryDto,
  ): Promise<XpRewardStoreAnalyticsResponseDto> {
    try {
      const { startDate, endDate } = query;
      const whereClause: any = {};
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          (whereClause.createdAt as any)[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          (whereClause.createdAt as any)[Op.lte] = new Date(endDate);
        }
      }

      // Define types for conversion and rewards
      const conversionTypes = ['AIRTIME_CONVERSION', 'SUBSCRIPTION_RENEWAL'];
      const rewardTypes = ['REWARD_STORE_PURCHASE', 'REWARD'];

      // 1. Total XP Converted (Airtime + Subscription)
      // We take the absolute value since spent XP should be negative
      const totalXpConvertedRaw =
        (await this.xpLogRepository.sum('xpValue', {
          where: {
            ...whereClause,
            xpType: { [Op.in]: conversionTypes },
          },
        })) || 0;
      const totalXpConverted = Math.abs(totalXpConvertedRaw);

      // 2. Total Used for Reward
      const totalUsedForRewardRaw =
        (await this.xpLogRepository.sum('xpValue', {
          where: {
            ...whereClause,
            xpType: { [Op.in]: rewardTypes },
          },
        })) || 0;
      const totalUsedForReward = Math.abs(totalUsedForRewardRaw);

      // 3. Average Daily Conversion
      let days = 1;
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        days = Math.max(
          1,
          Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
        );
      }
      const averageDailyConversion = totalXpConverted / days;

      // 4. XP Converted Over Time (Graph Data)
      const xpConvertedOverTimeRaw = await this.xpLogRepository.findAll({
        attributes: [
          [fn('DATE', col('createdAt')), 'date'],
          [fn('SUM', col('xpValue')), 'dailyXp'],
        ],
        where: {
          ...whereClause,
          xpType: { [Op.in]: [...conversionTypes, ...rewardTypes] },
        },
        group: [fn('DATE', col('createdAt'))],
        order: [[fn('DATE', col('createdAt')), 'ASC']],
        raw: true,
      });

      const xpConvertedOverTime = xpConvertedOverTimeRaw.map((item: any) => ({
        xp: Math.abs(parseFloat(String(item.dailyXp))),
        date: String(item.date),
      }));

      return {
        totalXpConverted,
        averageDailyConversion,
        totalUsedForReward,
        xpConvertedOverTime,
      };
    } catch (error: any) {
      throw new Error(
        stringify({
          message: (error as Error).message,
          stack: (error as Error).stack,
          details: (error as any).response || error,
        }),
      );
    }
  }

  async getXpConfig(): Promise<XpConfiguration> {
    const xp = await this.xpConfiguationService.findOne();
    if (!xp) {
      return await this.xpConfiguationService.initializeDefaultConfiguration();
    }
    return xp;
  }

  /**
   * Create a new XP log entry
   */
  async create(createXpLogDto: CreateXpLogDto): Promise<XpLog> {
    try {
      const xpLog = await this.xpLogRepository.create({
        ...createXpLogDto,
      });
      if (xpLog) {
        this.xpRecordService.addXp(createXpLogDto.userId, {
          xpValue: createXpLogDto.xpValue,
          detail: createXpLogDto.detail,
        });
      }
      return xpLog;
    } catch (error) {
      throw new Error(
        stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      );
    }
  }

  /**
   * Find all XP logs with user relation
   */
  async findAll(
    queryDto?: XpLogQueryDto,
  ): Promise<{ data: XpLog[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        xpType,
        startDate,
        endDate,
      } = queryDto || {};
      const offset = (page - 1) * limit;

      const whereClause: any = {};

      if (xpType) {
        whereClause.xpType = xpType;
      }

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.$gte = new Date(startDate);
        if (endDate) whereClause.createdAt.$lte = new Date(endDate);
      }

      const { count, rows } = await this.xpLogRepository.findAndCountAll({
        where: whereClause,
        include: ['user'],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        data: rows,
        total: count,
      };
    } catch (error) {
      throw new Error(
        stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      );
    }
  }

  /**
   * Find XP log by ID with user relation
   */
  async findOne(id: string): Promise<XpLog> {
    try {
      const xpLog = await this.xpLogRepository.findByPk(id, {
        include: ['user'],
      });
      if (!xpLog) {
        throw new Error(`XP log with ID ${id} not found`);
      }
      return xpLog;
    } catch (error) {
      throw new Error(
        stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      );
    }
  }

  /**
   * Find all XP logs for a specific user
   */
  async findByUserId(
    userId: string,
    queryDto?: XpLogQueryDto,
  ): Promise<{ data: XpLog[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        xpType,
        startDate,
        endDate,
      } = queryDto || {};
      const offset = (page - 1) * limit;

      const whereClause: any = { userId };

      if (xpType) {
        whereClause.xpType = xpType;
      }

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.$gte = new Date(startDate);
        if (endDate) whereClause.createdAt.$lte = new Date(endDate);
      }

      const { count, rows } = await this.xpLogRepository.findAndCountAll({
        where: whereClause,
        include: ['user'],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        data: rows,
        total: count,
      };
    } catch (error) {
      throw new Error(
        stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      );
    }
  }

  /**
   * Find XP logs by type for a specific user
   */
  async findByUserIdAndType(userId: string, xpType: string): Promise<XpLog[]> {
    try {
      const xpLogs = await this.xpLogRepository.findAll({
        where: { userId, xpType },
        include: ['user'],
        order: [['createdAt', 'DESC']],
      });
      return xpLogs;
    } catch (error) {
      throw new Error(
        stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      );
    }
  }

  /**
   * Update XP log by ID
   */
  async update(id: string, updateXpLogDto: UpdateXpLogDto): Promise<XpLog> {
    try {
      const xpLog = await this.xpLogRepository.findByPk(id);
      if (!xpLog) {
        throw new Error(`XP log with ID ${id} not found`);
      }
      await xpLog.update(updateXpLogDto);
      return xpLog;
    } catch (error) {
      throw new Error(
        stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      );
    }
  }

  /**
   * Delete XP log by ID
   */
  async remove(id: string): Promise<void> {
    try {
      const xpLog = await this.xpLogRepository.findByPk(id);
      if (!xpLog) {
        throw new Error(`XP log with ID ${id} not found`);
      }
      await xpLog.destroy();
    } catch (error) {
      throw new Error(
        stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      );
    }
  }

  /**
   * Get total XP earned by a user
   */
  async getTotalXpByUserId(userId: string): Promise<number> {
    try {
      const result = await this.xpLogRepository.sum('xpValue', {
        where: { userId },
      });
      return result || 0;
    } catch (error) {
      throw new Error(
        stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      );
    }
  }

  /**
   * Get XP summary by type for a user
   */
  async getXpSummaryByUserId(
    userId: string,
  ): Promise<{ xpType: string; totalXp: number }[]> {
    try {
      const result = await this.xpLogRepository.findAll({
        where: { userId },
        attributes: [
          'xpType',
          [
            this.xpLogRepository.sequelize.fn(
              'SUM',
              this.xpLogRepository.sequelize.col('xpValue'),
            ),
            'totalXp',
          ],
        ],
        group: ['xpType'],
        raw: true,
      });
      return result as any;
    } catch (error) {
      throw new Error(
        stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      );
    }
  }
}
