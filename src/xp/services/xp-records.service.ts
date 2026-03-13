import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import stringify from 'safe-stable-stringify';
import { XpRecords } from '../models/xp-record.model';
import {
  AddXpDto,
  CreateXpRecordsDto,
  UpdateXpRecordsDto,
} from '../dto/xp-records.dto';
import { Transaction } from 'sequelize';
import { LeaderboardQueryDto } from '../dto/xp-log.dto';

@Injectable()
export class XpRecordsService {
  constructor(
    @InjectModel(XpRecords)
    private xpRecordsRepository: typeof XpRecords,
  ) {}

  /**
   * Create a new XP record for a user
   */
  async create(createXpRecordsDto: CreateXpRecordsDto): Promise<XpRecords> {
    try {
      // Check if record already exists for user
      const existingRecord = await this.xpRecordsRepository.findOne({
        where: { userId: createXpRecordsDto.userId },
      });
      if (existingRecord) {
        throw new Error(
          `XP record already exists for user ${createXpRecordsDto.userId}. Use update instead.`,
        );
      }

      const xpRecord = await this.xpRecordsRepository.create({
        ...createXpRecordsDto,
        lastUpdatedAt: new Date(),
      });
      return xpRecord;
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
   * Find all XP records with user relation
   */
  async findAll(): Promise<XpRecords[]> {
    try {
      const xpRecords = await this.xpRecordsRepository.findAll({
        include: ['user'],
      });
      return xpRecords;
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
   * Find XP record by ID with user relation
   */
  async findOne(id: string): Promise<XpRecords> {
    try {
      const xpRecord = await this.xpRecordsRepository.findByPk(id, {
        include: ['user'],
      });
      if (!xpRecord) {
        throw new Error(`XP record with ID ${id} not found`);
      }
      return xpRecord;
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
   * Find XP record by user ID
   */
  async findByUserId(userId: string): Promise<XpRecords> {
    try {
      const xpRecord = await this.xpRecordsRepository.findOne({
        where: { userId },
        include: ['user'],
      });
      if (!xpRecord) {
        throw new Error(`XP record for user ${userId} not found`);
      }
      return xpRecord;
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
   * Update XP record by user ID
   */
  async updateByUserId(
    userId: string,
    updateXpRecordsDto: UpdateXpRecordsDto,
  ): Promise<XpRecords> {
    try {
      const xpRecord = await this.xpRecordsRepository.findOne({
        where: { userId },
      });
      if (!xpRecord) {
        throw new Error(`XP record for user ${userId} not found`);
      }

      await xpRecord.update({
        ...updateXpRecordsDto,
        lastUpdatedAt: new Date(),
      });

      return xpRecord;
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
   * Add XP to user's record
   */
  async addXp(userId: string, addXpDto: AddXpDto): Promise<XpRecords> {
    try {
      const { xpValue, detail } = addXpDto;
      const xpRecord = await this.xpRecordsRepository.findOne({
        where: { userId },
      });

      if (!xpRecord) {
        // Create new record if doesn't exist
        return await this.create({
          userId,
          previousXpValue: 0,
          currentXpValue: xpValue,
          lastRecordDetail: detail,
          lastUpdatedAt: new Date(),
        });
      }

      // Update existing record
      await xpRecord.update({
        previousXpValue: xpRecord.currentXpValue,
        currentXpValue: xpRecord.currentXpValue + xpValue,
        lastRecordDetail: detail,
        lastUpdatedAt: new Date(),
      });

      return xpRecord;
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
   * Get user's current XP
   */
  async getCurrentXp(userId: string): Promise<number> {
    try {
      const xpRecord = await this.xpRecordsRepository.findOne({
        where: { userId },
      });
      if (!xpRecord) {
        return 0;
      }
      return xpRecord.currentXpValue;
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
   * Get XP leaderboard (top users by XP)
   */
  async getLeaderboard(
    leaderboardQueryDto?: LeaderboardQueryDto,
  ): Promise<XpRecords[]> {
    try {
      const { limit = 10 } = leaderboardQueryDto || {};
      const leaderboard = await this.xpRecordsRepository.findAll({
        include: [
          {
            association: 'user',
            required: true,
            include: [
              { association: 'lessons' },
              { association: 'quizRecords' },
            ],
          },
        ],
        order: [['currentXpValue', 'DESC']],
        limit,
      });
      return leaderboard;
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
   * Delete XP record by ID
   */
  async remove(id: string): Promise<void> {
    try {
      const xpRecord = await this.xpRecordsRepository.findByPk(id);
      if (!xpRecord) {
        throw new Error(`XP record with ID ${id} not found`);
      }
      await xpRecord.destroy();
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
   * Delete XP record by user ID
   */
  async removeByUserId(userId: string): Promise<void> {
    try {
      const xpRecord = await this.xpRecordsRepository.findOne({
        where: { userId },
      });
      if (!xpRecord) {
        throw new Error(`XP record for user ${userId} not found`);
      }
      await xpRecord.destroy();
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

  async resetUserXp(userId: string, transaction: Transaction): Promise<void> {
    try {
      const xpRecord = await this.xpRecordsRepository.findOne({
        where: { userId },
        transaction,
      });

      if (xpRecord) {
        await xpRecord.update(
          {
            currentXpValue: 0,
            previousXpValue: 0,
            lastRecordDetail: 'XP reset by admin',
            lastUpdatedAt: new Date(),
          },
          { transaction },
        );
      }
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
