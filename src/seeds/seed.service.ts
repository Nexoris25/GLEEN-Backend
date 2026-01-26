import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';

import { User } from '../user/models/user.model';
import { State } from '../states/models/state.model';
import { Country } from '../countries/models/country.model';
import { Lga } from 'src/states/models/lga.model';

import { STATES } from './states.seed';
import { COUNTRIES } from './countries.seed';
import { LGAS_BY_STATE } from './lgas.seed';

import { Subscription } from '../subscription/models/Subscription.model';
import { SUBSCRIPTIONS } from './subscriptions.seed';


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

    const stateMap = new Map(
      states.map((state) => [state.title, state.id]),
    );

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
}
