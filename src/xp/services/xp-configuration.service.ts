import { Injectable } from '@nestjs/common';
import { XpConfiguration } from '../models/xp-configuration.model';
import { CreateXpConfigurationDto } from '../dto/create-xp-configuration.dto';
import { UpdateXpConfigurationDto } from '../dto/update-xp-configuration.dto';
import stringify from 'safe-stable-stringify';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class XpConfigurationService {

    constructor(
        @InjectModel(XpConfiguration)
        private xpConfigurationRepository: typeof XpConfiguration,
    ) { }

    /**
     * Create a new XP configuration
     */
    async create(createXpConfigurationDto: CreateXpConfigurationDto): Promise<XpConfiguration> {
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
            throw new Error(stringify({
                message: error.message,
                stack: error.stack,
                details: error.response || error,
            }));
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
            };

            const xpConfiguration = await this.xpConfigurationRepository.create({ ...defaultConfig });

            return xpConfiguration;
        } catch (error) {
            throw new Error(stringify({
                message: error.message,
                stack: error.stack,
                details: error.response || error,
            }));
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
            throw new Error(stringify({
                message: error.message,
                stack: error.stack,
                details: error.response || error,
            }));
        }
    }

    /**
     * Update XP configuration by ID
     */
    async update(updateXpConfigurationDto: UpdateXpConfigurationDto): Promise<XpConfiguration> {
        try {
            const xpConfiguration = await this.xpConfigurationRepository.findOne();
            if (!xpConfiguration) {
                throw new Error('XP configuration not found. Please create one first.');
            }
            await xpConfiguration.update(updateXpConfigurationDto);

            return xpConfiguration;
        } catch (error) {
            throw new Error(stringify({
                message: error.message,
                stack: error.stack,
                details: error.response || error,
            }));
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
            throw new Error(stringify({
                message: error.message,
                stack: error.stack,
                details: error.response || error,
            }));
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
            throw new Error(stringify({
                message: error.message,
                stack: error.stack,
                details: error.response || error,
            }));
        }
    }
}