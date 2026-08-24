import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from '../user/models/user.model';
import { State } from '../states/models/state.model';
import { Country } from '../countries/models/country.model';
import { Lga } from 'src/states/models/lga.model';
import { Subscription } from '../subscription/models/Subscription.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User, State, Country, Lga, Subscription]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
