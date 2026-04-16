import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { V1Battle } from './models/v1-battle.model';
import { V1BattleQuestionAnswers } from './models/v1-battle-question-answers.model';
import { V1BattleService } from './services/v1-battle.service';
import { V1BattleController } from './controllers/v1-battle.controller';
import { V1BattleQuestionAnswersService } from './services/v1-battle-question-answers.service';
import { V1BattleQuestionAnswersController } from './controllers/v1-battle-question-answers.controller';
import { V1BattleRecord } from './models/v1-battle-record.model';
import { V1BattleRecordService } from './services/v1-battle-record.service';
import { V1BattleRecordController } from './controllers/v1-battle-record.controller';
import { JwtModule } from '@nestjs/jwt';
import { XpModule } from 'src/xp/xp.module';
import { LessonModule } from 'src/lesson/lesson.module';
import { NotificationTrackingModule } from 'src/notification-tracking/notification-tracking.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    SequelizeModule.forFeature([
      V1Battle,
      V1BattleQuestionAnswers,
      V1BattleRecord,
    ]),
    forwardRef(() => XpModule),
    forwardRef(() => LessonModule),
    forwardRef(() => NotificationTrackingModule),
  ],
  providers: [
    V1BattleService,
    V1BattleQuestionAnswersService,
    V1BattleRecordService,
  ],
  controllers: [
    V1BattleController,
    V1BattleQuestionAnswersController,
    V1BattleRecordController,
  ],
  exports: [
    V1BattleService,
    V1BattleQuestionAnswersService,
    V1BattleRecordService,
  ],
})
export class V1BattleModule {}
