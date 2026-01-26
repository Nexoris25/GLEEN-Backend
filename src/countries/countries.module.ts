import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Country } from './models/country.model';

@Module({
  imports: [SequelizeModule.forFeature([Country])],
  exports: [SequelizeModule],
})
export class CountriesModule {}
