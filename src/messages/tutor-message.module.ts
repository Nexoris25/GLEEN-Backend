// src/messages/tutor-message.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TutorMessage } from './models/tutor-message.model';
import { NotificationTracking } from 'src/notification-tracking/models/notification-recipient.model';
import { TutorMessageService } from './services/tutor-message.service';
import { TutorMessageController } from './controllers/tutor-message.controller';
import { User } from 'src/user/models/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([TutorMessage, NotificationTracking, User]),
  ],
  controllers: [TutorMessageController],
  providers: [TutorMessageService],
})
export class TutorMessageModule {}
