import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { State } from './models/state.model';
import { City } from './models/city.model';
import { StatesService } from './services/state.service';
import { StateController } from './controllers/state.controller';
import { JwtModule } from '@nestjs/jwt';
import { StateExistsConstraint } from '../common/validators/IsStateExists';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    SequelizeModule.forFeature([State, City]),
  ],
  providers: [StatesService, StateExistsConstraint],
  controllers: [StateController],
  exports: [StatesService, StateExistsConstraint],
})
export class StatesModule {}
