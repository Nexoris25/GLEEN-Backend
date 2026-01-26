import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GoalController } from './controllers/goal.controller';
import { GoalsService } from './services/goal.service';
import { Goal } from './models/goal.model';
import { UserGoal } from './models/user-goal.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    SequelizeModule.forFeature([
      Goal, UserGoal
    ]),
  ],
  providers: [
    GoalsService,
  ],
  controllers: [
    GoalController,
  ],
  exports: [
    GoalsService,
  ],
})
export class GoalModule { }
