import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';

import { Lga } from './models/lga.model';
import { State } from '../states/models/state.model';

import { LgaService } from './services/lga.service';
import { LgaController } from './controllers/lga.controller';
import { StateExistsConstraint } from 'src/common/validators/IsStateExists';

@Module({
  imports: [
    // JWT module for role-based access
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    // Sequelize models
    SequelizeModule.forFeature([Lga, State]),
  ],
  providers: [LgaService, StateExistsConstraint],
  controllers: [LgaController],
  exports: [LgaService, StateExistsConstraint], // export service if needed in other modules
})
export class LgaModule {}
