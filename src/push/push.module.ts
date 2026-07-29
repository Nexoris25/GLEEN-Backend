import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DeviceToken } from './models/device-token.model';
import { NotificationSettings } from '../notification/models/notification-settings.model';
import { User } from '../user/models/user.model';
import { FirebaseAdminService } from './services/firebase-admin.service';
import { DeviceTokenService } from './services/device-token.service';
import { PushService } from './services/push.service';
import { DeviceTokenController } from './controllers/device-token.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([DeviceToken, NotificationSettings, User]),
  ],
  controllers: [DeviceTokenController],
  providers: [FirebaseAdminService, DeviceTokenService, PushService],
  exports: [PushService, DeviceTokenService],
})
export class PushModule {}
