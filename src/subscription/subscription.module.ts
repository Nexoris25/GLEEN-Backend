import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from '../email/email.module';
import { Subscription } from './models/Subscription.model';
import { SubscriptionTransaction } from './models/subscription-transaction.model';
import { SubscriptionService } from './services/subscription.service';
import { SubscriptionTransactionService } from './services/subscription-transaction.service';
import { SubscriptionController } from './controllers/subscription.controller';
import { SubscriptionTransactionController } from './controllers/subscription-transaction.controller';
import { JwtModule } from '@nestjs/jwt';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SubscriptionStatusInterceptor } from './interceptors/subscription-status.interceptor';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    SequelizeModule.forFeature([Subscription, SubscriptionTransaction]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => MailModule),
  ],
  providers: [
    SubscriptionService,
    SubscriptionTransactionService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SubscriptionStatusInterceptor,
    },
  ],
  controllers: [SubscriptionController, SubscriptionTransactionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
