import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../user/models/user.model';
import { State } from '../states/models/state.model';
import { Country } from '../countries/models/country.model';
import { Lga } from 'src/states/models/lga.model';

import { STATES } from './states.seed';
import { COUNTRIES } from './countries.seed';
import { LGAS_BY_STATE } from './lgas.seed';

import { Subscription } from '../subscription/models/Subscription.model';
import { SUBSCRIPTIONS } from './subscriptions.seed';

import { XpConfiguration } from '../xp/models/xp-configuration.model';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(State) private stateModel: typeof State,
    @InjectModel(Country) private countryModel: typeof Country,
    @InjectModel(Lga) private lgaModel: typeof Lga,
    @InjectModel(Subscription) private subscriptionModel: typeof Subscription,
  ) {}

  async onModuleInit() {
    await this.seedCountries();
    const adminUser = await this.seedAdminUser();
    await this.seedStates(adminUser.id);
    await this.seedLgas();
    await this.seedSubscriptions();
    await this.seedXpConfig();
  }

  // --------------------
  // Countries
  // --------------------
  private async seedCountries() {
    for (const country of COUNTRIES) {
      await this.countryModel.findOrCreate({
        where: { code: country.code },
        defaults: country,
      });
    }
    this.logger.log('✅ Countries seeded');
  }

  // --------------------
  // Subscriptions
  // --------------------
  private async seedSubscriptions() {
    for (const subscription of SUBSCRIPTIONS) {
      await this.subscriptionModel.findOrCreate({
        where: {
          name: subscription.name,
          range: subscription.range,
        },
        defaults: subscription,
      });
    }

    this.logger.log('✅ Subscriptions seeded');
  }

  // --------------------
  // Admin User
  // --------------------
  private async seedAdminUser() {
    const email = 'admin@local.local';

    let user = await this.userModel.findOne({ where: { email } });

    if (!user) {
      const passwordHash = await bcrypt.hash('admin2832', 10);

      let defaultState = await this.stateModel.findOne();
      if (!defaultState) {
        defaultState = await this.stateModel.create(
          {
            title: 'Default State',
            userId: null,
          },
          { hooks: false },
        );
      }

      user = await this.userModel.create({
        username: 'admin',
        role: 'SUPER_ADMIN',
        email,
        password: passwordHash,
        stateId: defaultState.id,
        isEmailVerified: true,
      });

      this.logger.log('✅ Admin user created');
    } else {
      this.logger.log('ℹ️ Admin user already exists');
    }

    return user;
  }

  // --------------------
  // States
  // --------------------
  private async seedStates(adminUserId: string) {
    for (const state of STATES) {
      const exists = await this.stateModel.findOne({
        where: { title: state.title },
      });

      if (!exists) {
        await this.stateModel.create(
          {
            title: state.title,
            userId: adminUserId,
          },
          { hooks: false },
        );
      }
    }

    this.logger.log('✅ States seeded');
  }

  // --------------------
  // LGAs (NEW)
  // --------------------
  private async seedLgas() {
    const states = await this.stateModel.findAll({
      attributes: ['id', 'title'],
    });

    const stateMap = new Map(states.map((state) => [state.title, state.id]));

    for (const [stateTitle, lgas] of Object.entries(LGAS_BY_STATE)) {
      const stateId = stateMap.get(stateTitle);

      if (!stateId) {
        this.logger.warn(`⚠️ State not found for LGAs: ${stateTitle}`);
        continue;
      }

      for (const lgaTitle of lgas) {
        await this.lgaModel.findOrCreate({
          where: {
            title: lgaTitle,
            stateId,
          },
          defaults: {
            title: lgaTitle,
            stateId,
          },
        });
      }
    }

    this.logger.log('✅ LGAs seeded');
  }

  // --------------------
  // XP Defaults
  // --------------------
  async seedXpConfig() {
    try {
      const exists = await XpConfiguration.count();
      if (exists === 0) {
        await XpConfiguration.create({
          id: uuidv4(),
          dailyMaxXpLimitForLessons: 0,
          xpValueForMockTheory: 0,
          xpValueForMockObjective: 0,
          xpValueForJamb: 0,
          dailyMaxXpLimitForQuizzes: 0,
          dailyMaxXpLimitForMockExams: 0,
          dailyMaxXpLimitForV1Battles: 0,
          xpValueForLessThanOrEqualTo1HourLesson: 0,
          xpValueForGreaterThan1HourLessThanOrEqualTo4HoursLesson: 0,
          xpValueForGreaterThan4HourLessThanOrEqualTo10HoursLesson: 0,
          xpValueForGreaterThan10HourLessThanOrEqualTo24HoursLesson: 0,
          xpValueForLessThanOrEqualTo10QuizQuestion: 0,
          xpValueForGreaterThan10LessThanOrEqualTo20QuizQuestion: 0,
          xpValueForGreaterThan20LessThanOrEqualTo30QuizQuestion: 0,
          xpValueForGreaterThan30QuizQuestion: 0,
          xpValueForLessThanOrEqualTo10MockQuestion: 0,
          xpValueForGreaterThan10LessThanOrEqualTo20MockQuestion: 0,
          xpValueForGreaterThan20LessThanOrEqualTo30MockQuestion: 0,
          xpValueForGreaterThan30MockQuestion: 0,
          xpValueForLessThanOrEqualTo10V1BattleQuestion: 0,
          xpValueForGreaterThan10LessThanOrEqualTo20V1BattleQuestion: 0,
          xpValueForGreaterThan20LessThanOrEqualTo30V1BattleQuestion: 0,
          xpValueForGreaterThan30V1BattleQuestion: 0,
          v1BattleXpWinBonus: 0,
          v1BattleXpLoseBonus: 0,
          v1BattleXpDrawBonus: 0,
          xpValuePerReferral: 0,
          xpValuePerDayLogin: 0,
          xpMultiplierValue: 1,
          xpMultiplierDays: 0,
          xpMultiplierEnabled: false,
        });
        console.log('✅ XpConfiguration seeded successfully with 0 values');
      } else {
        console.log('ℹ️ XpConfiguration already exists, skipping seed');
      }
    } catch (error) {
      console.error('❌ Error seeding XpConfiguration:', error);
    }
  }
}
