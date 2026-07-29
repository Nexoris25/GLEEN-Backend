import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { PaystackController } from './controller/paystack.controller';
import { PaymentsController } from './controller/payments.controller';
import { PaymentsService } from './services/payments.service';
import { PaystackGateway } from './gateways/paystack.gateway';
import { PaymentGatewayRegistry } from './gateways/payment-gateway.registry';
import { SubscriptionTransaction } from '../subscription/models/subscription-transaction.model';
import { Subscription } from '../subscription/models/Subscription.model';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forFeature([SubscriptionTransaction, Subscription]),
  ],
  controllers: [PaymentsController, PaystackController],
  providers: [PaystackGateway, PaymentGatewayRegistry, PaymentsService],
  exports: [PaymentsService],
})
export class PaystackModule {}
