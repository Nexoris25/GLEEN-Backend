import { Injectable } from '@nestjs/common';
import { XpConfiguration } from '../models/xp-configuration.model';
import { CreateXpConfigurationDto } from '../dto/create-xp-configuration.dto';
import { UpdateXpConfigurationDto } from '../dto/update-xp-configuration.dto';
import { UpdateXpMultiplierDto } from '../dto/update-xp-multiplier.dto';
import stringify from 'safe-stable-stringify';
import { InjectModel } from '@nestjs/sequelize';
import { getMultiplierItemForKey } from '../constants/xp-multiplier-keys';

@Injectable()
export class XpConfigurationService {
  constructor(
    @InjectModel(XpConfiguration)
    private xpConfigurationRepository: typeof XpConfiguration,
  ) {}

  /**
   * Create a new XP configuration
   */
  async create(
    createXpConfigurationDto: CreateXpConfigurationDto,
  ): Promise<XpConfiguration> {
    try {
      // Check if configuration already exists
      const existingConfig = await this.xpConfigurationRepository.findOne();
      if (existingConfig) {
        throw new Error('XP configuration already exists. Use update instead.');
      }

      const xpConfiguration = await this.xpConfigurationRepository.create({
        ...createXpConfigurationDto,
      });
      return xpConfiguration;
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
   * Initialize default XP configuration if none exists
   */
  async initializeDefaultConfiguration(): Promise<XpConfiguration> {
    try {
      const existingConfig = await this.xpConfigurationRepository.findOne();
      if (existingConfig) {
        return existingConfig;
      }

      const defaultConfig: CreateXpConfigurationDto = {
        dailyMaxXpLimitForLessons: 1000,
        dailyMaxXpLimitForQuizzes: 800,
        dailyMaxXpLimitForMockExams: 1200,
        dailyMaxXpLimitForV1Battles: 600,
        xpValueForLessThanOrEqualTo1HourLesson: 50,
        xpValueForGreaterThan1HourLessThanOrEqualTo4HoursLesson: 100,
        xpValueForGreaterThan4HourLessThanOrEqualTo10HoursLesson: 200,
        xpValueForGreaterThan10HourLessThanOrEqualTo24HoursLesson: 300,
        xpValueForLessThanOrEqualTo10QuizQuestion: 25,
        xpValueForGreaterThan10LessThanOrEqualTo20QuizQuestion: 50,
        xpValueForGreaterThan20LessThanOrEqualTo30QuizQuestion: 75,
        xpValueForGreaterThan30QuizQuestion: 100,
        xpValueForLessThanOrEqualTo10MockQuestion: 30,
        xpValueForGreaterThan10LessThanOrEqualTo20MockQuestion: 60,
        xpValueForGreaterThan20LessThanOrEqualTo30MockQuestion: 90,
        xpValueForGreaterThan30MockQuestion: 120,
        xpValueForJamb: 30,
        xpValueForMockObjective: 60,
        xpValueForMockTheory: 90,
        // xpValueForGreaterThan30MockJambQuestion: 120,
        // xpValueForLessThanOrEqualTo10MockNecoQuestion: 30,
        // xpValueForGreaterThan10LessThanOrEqualTo20MockNecoQuestion: 60,
        // xpValueForGreaterThan20LessThanOrEqualTo30MockNecoQuestion: 90,
        // xpValueForGreaterThan30MockNecoQuestion: 120,
        // xpValueForLessThanOrEqualTo10MockWaecQuestion: 30,
        // xpValueForGreaterThan10LessThanOrEqualTo20MockWaecQuestion: 60,
        // xpValueForGreaterThan20LessThanOrEqualTo30MockWaecQuestion: 90,
        // xpValueForGreaterThan30MockWaecQuestion: 120,
        xpValueForLessThanOrEqualTo10V1BattleQuestion: 20,
        xpValueForGreaterThan10LessThanOrEqualTo20V1BattleQuestion: 40,
        xpValueForGreaterThan20LessThanOrEqualTo30V1BattleQuestion: 60,
        xpValueForGreaterThan30V1BattleQuestion: 80,
        v1BattleXpWinBonus: 50,
        v1BattleXpLoseBonus: 10,
        v1BattleXpDrawBonus: 25,
        xpValuePerReferral: 100,
        xpValuePerDayLogin: 10,
        xpLimitPerTimePercentage: 10,
        xpLimitPerDayPercentage: 20,
        airtimeXpValuePerNaira: 100,
        scholarSubscriptionXpRequired: 5000,
        championSubscriptionXpRequired: 10000,
        showRealNames: false,
        anonymizeOutsideTop10: true,
        allowOptOut: true,
        showRankMovement: true,
      };

      const xpConfiguration = await this.xpConfigurationRepository.create({
        ...defaultConfig,
      });

      return xpConfiguration;
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
   * Find XP configuration by ID
   */
  async findOne(): Promise<XpConfiguration> {
    try {
      const xpConfiguration = await this.xpConfigurationRepository.findOne();
      if (!xpConfiguration) {
        throw new Error(`XP configuration not found, please create one first`);
      }
      return xpConfiguration;
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
   * Update XP configuration by ID
   */
  async update(
    updateXpConfigurationDto: UpdateXpConfigurationDto,
  ): Promise<XpConfiguration> {
    try {
      const xpConfiguration = await this.xpConfigurationRepository.findOne();
      if (!xpConfiguration) {
        throw new Error('XP configuration not found. Please create one first.');
      }
      await xpConfiguration.update(updateXpConfigurationDto);

      return xpConfiguration;
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
   * Delete XP configuration by ID
   */
  async remove(id: string): Promise<void> {
    try {
      const xpConfiguration = await this.xpConfigurationRepository.findByPk(id);
      if (!xpConfiguration) {
        throw new Error(`XP configuration with ID ${id} not found`);
      }

      await xpConfiguration.destroy();
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
   * Get the first XP configuration (typically there should only be one)
   */
  async getCurrentConfiguration(): Promise<XpConfiguration> {
    try {
      const xpConfiguration = await this.xpConfigurationRepository.findOne();
      if (!xpConfiguration) {
        throw new Error('No XP configuration found');
      }
      return xpConfiguration;
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

  getMultiplierState(config: XpConfiguration) {
    const enabled = Boolean(config.xpMultiplierEnabled);
    const key = config.xpMultiplierKey || null;
    const multiplierValue = Number(config.xpMultiplierValue ?? 1);
    const days = Number(config.xpMultiplierDays ?? 0);
    const startAt = config.xpMultiplierStartAt
      ? new Date(config.xpMultiplierStartAt)
      : null;

    const endAt =
      startAt && Number.isFinite(days) && days > 0
        ? new Date(startAt.getTime() + days * 24 * 60 * 60 * 1000)
        : null;

    const now = new Date();
    const isActive =
      enabled &&
      Boolean(key) &&
      Number.isFinite(multiplierValue) &&
      multiplierValue !== 1 &&
      Boolean(startAt) &&
      Boolean(endAt) &&
      now >= startAt &&
      now < endAt;

    return {
      enabled,
      key,
      multiplierValue,
      days,
      startAt,
      endAt,
      name: config.xpMultiplierName || null,
      details: config.xpMultiplierDetails || null,
      isActive,
    };
  }

  applyMultiplierIfNeeded(
    config: XpConfiguration,
    multiplierKey: string,
    value: number,
  ) {
    const state = this.getMultiplierState(config);
    if (!state.isActive) return value;
    if (state.key !== multiplierKey) return value;
    return value * state.multiplierValue;
  }

  async updateMultiplier(updateDto: UpdateXpMultiplierDto) {
    try {
      const xpConfiguration = await this.xpConfigurationRepository.findOne();
      if (!xpConfiguration) {
        throw new Error('XP configuration not found. Please create one first.');
      }

      const startAt = updateDto.startAt
        ? new Date(updateDto.startAt)
        : new Date();
      const enabled = updateDto.enabled ?? true;

      const item = getMultiplierItemForKey(updateDto.key);
      if (!item) {
        throw new Error('Invalid multiplier key');
      }

      await xpConfiguration.update({
        xpMultiplierKey: updateDto.key,
        xpMultiplierValue: updateDto.multiplierValue,
        xpMultiplierDays: updateDto.days,
        xpMultiplierStartAt: startAt,
        xpMultiplierName: updateDto.name,
        xpMultiplierDetails: updateDto.details,
        xpMultiplierEnabled: enabled,
      });

      return xpConfiguration;
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
