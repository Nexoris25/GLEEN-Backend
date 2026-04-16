import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Paystack from 'paystack';
import { InjectModel } from '@nestjs/sequelize';
import { SubscriptionTransaction } from '../../subscription/models/subscription-transaction.model';
import { Subscription } from '../../subscription/models/Subscription.model';
import { SubscriptionPlanEnum } from '../../shared-types/subscription-plan.enum';

@Injectable()
export class PaystackService {
  private paystack: any;

  constructor(
    private configService: ConfigService,
    @InjectModel(SubscriptionTransaction)
    private readonly transactionModel: typeof SubscriptionTransaction,

    @InjectModel(Subscription)
    private readonly subscriptionModel: typeof Subscription,
  ) {
    const secretKey =
      this.configService.get<string>('PAYSTACK_SECRET_KEY') ||
      process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      throw new Error(
        'PAYSTACK_SECRET_KEY is missing in environment variables',
      );
    }

    // ✅ Paystack is a function — DO NOT use "new"
    this.paystack = Paystack(secretKey);
  }

  // -----------------------
  // 1️⃣ Initialize Transaction & Save PENDING in DB
  // -----------------------
  async initializeTransaction(
    email: string,
    plan: SubscriptionPlanEnum,
    userId: string,
    subscriptionId: string,
  ) {
    // 1️⃣ Fetch subscription
    const subscription = await this.subscriptionModel.findByPk(subscriptionId);
    if (!subscription) {
      throw new BadRequestException(
        `Subscription with ID "${subscriptionId}" does not exist`,
      );
    }

    // 2️⃣ Determine amount based on plan
    let amount: number = subscription.amount ?? 0; // ✅ use nullish coalescing
    if (plan === SubscriptionPlanEnum.YEARLY) {
      amount = amount * 12 - amount;
    }
    const now = new Date();
    const monthsToAdd = plan === SubscriptionPlanEnum.YEARLY ? 12 : 1;
    const expiryDate = new Date(now);
    expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

    try {
      // 3️⃣ Initialize Paystack transaction
      const response = await this.paystack.transaction.initialize({
        email,
        amount: Math.round(amount * 100), // convert to kobo
        metadata: { subscriptionId, userId, plan },
      });

      if (!response.status) {
        throw new Error(response.message || 'Initialization failed');
      }

      // 4️⃣ Save transaction to DB as PENDING
      await this.transactionModel.create({
        userId,
        subscriptionId,
        amount,
        plan,
        status: 'PENDING',
        reference: response.data.reference,
        expiryDate: expiryDate,
      });

      return response.data; // { authorization_url, access_code, reference }
    } catch (error: any) {
      console.error('Paystack initialize error:', error);
      throw new BadRequestException(
        error.message || 'Failed to initialize Paystack transaction',
      );
    }
  }

  // -----------------------
  // Process Paystack webhook
  // -----------------------
  async processWebhook(payload: any) {
    const event = payload.event;
    const data = payload.data;
    const reference = data.reference;

    // Find only PENDING transactions
    const transaction = await this.transactionModel.findOne({
      where: { reference, status: 'PENDING' },
    });

    if (!transaction) {
      return { message: 'Transaction not pending or not found' };
    }

    // Update status based on Paystack event
    switch (event) {
      case 'charge.success':
        transaction.status = 'PAID';
        break;
      case 'charge.failed':
        transaction.status = 'FAILED';
        break;
      case 'charge.cancelled':
        transaction.status = 'CANCELLED';
        break;
      case 'transfer.reversed':
        transaction.status = 'REFUNDED';
        break;
      default:
        return { message: 'Event ignored' };
    }

    await transaction.save();
    return { message: 'Transaction updated' };
  }

  // -----------------------
  // 2️⃣ Verify Transaction
  // -----------------------
  async verifyTransaction(reference: string) {
    try {
      const response = await this.paystack.transaction.verify(reference);

      if (!response.status) {
        throw new Error('Verification failed');
      }

      // Update status in DB
      const txn = await this.transactionModel.findOne({ where: { reference } });
      if (txn) {
        txn.status =
          response.data.status === 'success'
            ? 'PAID'
            : response.data.status === 'failed'
              ? 'FAILED'
              : txn.status; // leave as PENDING for other statuses
        await txn.save();
      }

      return response.data;
    } catch (error: any) {
      console.error('Paystack verify error:', error);
      throw new BadRequestException('Transaction verification failed');
    }
  }
}
