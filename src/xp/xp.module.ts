import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from '../email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { XpLog } from './models/xp-log.model';
import { XpRecords } from './models/xp-record.model';
import { XpConfiguration } from './models/xp-configuration.model';
import { XpConfigurationService } from './services/xp-configuration.service';
import { XpRecordsService } from './services/xp-records.service';
import { XpLogService } from './services/xp-log.service';
import { StreakConfigurationService } from './services/streak-configuration.service';
import { LeaderboardRankRewardService } from './services/leaderboard-rank-reward.service';
import { XpConfigurationController } from './controllers/xp-configuration.controller';
import { XpRecordsController } from './controllers/xp-record.controller';
import { XpLogController } from './controllers/xp-log.controller';
import {
  StreakConfiguration,
  StreakMilestoneReward,
} from './models/streak-configuration.model';
import { UserStreak, UserStreakLog } from './models/user-streak.model';
import { LeaderboardRankReward } from './models/leaderboard-rank-reward.model';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    SequelizeModule.forFeature([
      XpLog,
      XpRecords,
      XpConfiguration,
      StreakConfiguration,
      StreakMilestoneReward,
      UserStreak,
      UserStreakLog,
      LeaderboardRankReward,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => MailModule),
  ],
  providers: [
    XpConfigurationService,
    XpRecordsService,
    XpLogService,
    StreakConfigurationService,
    LeaderboardRankRewardService,
  ],
  controllers: [
    XpConfigurationController,
    XpRecordsController,
    XpLogController,
  ],
  exports: [
    XpConfigurationService,
    XpRecordsService,
    XpLogService,
    StreakConfigurationService,
    LeaderboardRankRewardService,
  ],
})
export class XpModule {}
