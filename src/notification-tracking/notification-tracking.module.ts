// src/notifications/notification-tracking.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotificationTracking } from './models/notification-recipient.model';
import { V1Battle } from 'src/v1-battle/models/v1-battle.model';
import { TutorMessage } from 'src/messages/models/tutor-message.model';
import { NotificationReadService } from './services/notification-read.service';
import { NotificationTrackingController } from './controllers/notification-tracking.controller';
//import { NotificationAggregatorController } from './controllers/notification-aggregator.controller';
import { NotificationAggregatorService } from './services/notification-aggregator.service';

@Module({
  imports: [
    SequelizeModule.forFeature([NotificationTracking, V1Battle, TutorMessage]),
  ],
  controllers: [NotificationTrackingController],
  providers: [NotificationReadService, NotificationAggregatorService],
  exports: [NotificationReadService, NotificationAggregatorService],
})
export class NotificationTrackingModule {}
