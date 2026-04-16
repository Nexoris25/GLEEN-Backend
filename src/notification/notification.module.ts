import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';

import { JwtModule } from '@nestjs/jwt';
import { NotificationSettings } from './models/notification-settings.model';
import { NotificationSettingsService } from './services/notification-settings.service';
import { NotificationSettingsController } from './controllers/notification-settings.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    SequelizeModule.forFeature([NotificationSettings]),
    forwardRef(() => AuthModule),
  ],
  providers: [NotificationSettingsService],
  controllers: [NotificationSettingsController],
  exports: [NotificationSettingsService],
})
export class NotificationModule {}
