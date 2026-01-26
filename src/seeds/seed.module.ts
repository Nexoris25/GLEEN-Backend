import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { SeedService } from './seed.service';
import { User } from '../user/models/user.model';
import { State } from '../states/models/state.model';
import { Country } from '../countries/models/country.model';
import { Lga } from 'src/states/models/lga.model'; 
import { Subscription } from '../subscription/models/Subscription.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User, State, Country, Lga, Subscription,]), // only models here
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
