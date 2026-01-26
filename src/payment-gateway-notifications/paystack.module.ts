import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { PaystackService } from './services/paystack.service';
import { PaystackController } from './controller/paystack.controller';
import { SubscriptionTransaction } from '../subscription/models/subscription-transaction.model';
import { Subscription } from '../subscription/models/Subscription.model';

@Module({
  imports: [
    ConfigModule,
    // ✅ Make the SubscriptionTransaction model injectable
    SequelizeModule.forFeature([SubscriptionTransaction, Subscription]),
  ],
  controllers: [PaystackController],
  providers: [PaystackService],
  exports: [PaystackService],
})
export class PaystackModule {}
