import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError } from 'sequelize';
import { SubscriptionTransaction } from '../../subscription/models/subscription-transaction.model';
import { Subscription } from '../../subscription/models/Subscription.model';
import { User } from '../../user/models/user.model';
import { SubscriptionPlanEnum } from '../../shared-types/subscription-plan.enum';
import { PaymentProvider } from '../../shared-types/payment-provider.enum';
import { PaymentMethod } from '../../shared-types/payment-method.enum';
import { PaymentGatewayRegistry } from '../gateways/payment-gateway.registry';

/** Yearly = monthly × this many months. Introduce a discount here via config later. */
const YEARLY_MONTHS = 12;

export interface InitializeInput {
  subscriptionId: string;
  plan: SubscriptionPlanEnum;
  provider?: PaymentProvider;
  method?: PaymentMethod;
  metadata?: Record<string, any>;
}

export interface InitializeOutput {
  reference: string;
  authorizationUrl?: string;
  /** True when this key already resulted in a completed payment. */
  alreadyPaid?: boolean;
  status: SubscriptionTransaction['status'];
}

/**
 * Provider-agnostic payment orchestration. Owns all DB writes and the
 * idempotency guarantees; delegates PSP calls to the gateway registry.
 */
@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(SubscriptionTransaction)
    private readonly txnModel: typeof SubscriptionTransaction,
    @InjectModel(Subscription)
    private readonly subscriptionModel: typeof Subscription,
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly gateways: PaymentGatewayRegistry,
  ) {}

  private computeAmountAndExpiry(baseAmount: number, plan: SubscriptionPlanEnum) {
    const months = plan === SubscriptionPlanEnum.YEARLY ? YEARLY_MONTHS : 1;
    const amount =
      plan === SubscriptionPlanEnum.YEARLY ? baseAmount * YEARLY_MONTHS : baseAmount;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);
    return { amount, expiryDate };
  }

  private toOutput(txn: SubscriptionTransaction): InitializeOutput {
    return {
      reference: txn.reference,
      authorizationUrl: txn.authorizationUrl ?? undefined,
      alreadyPaid: txn.status === 'PAID',
      status: txn.status,
    };
  }

  /**
   * Start (or re-return) a payment. Idempotent on (userId, idempotencyKey):
   * the same key never creates a second transaction or a second gateway charge.
   */
  async initialize(
    userId: string,
    email: string,
    input: InitializeInput,
    idempotencyKey?: string,
  ): Promise<InitializeOutput> {
    const { subscriptionId, plan } = input;
    if (!subscriptionId || !plan) {
      throw new BadRequestException('subscriptionId and plan are required');
    }

    // 1️⃣ Idempotent short-circuit — a known key returns its existing result.
    if (idempotencyKey) {
      const existing = await this.txnModel.findOne({
        where: { userId, idempotencyKey },
      });
      if (existing) return this.toOutput(existing);
    }

    // 2️⃣ Price the plan.
    const subscription = await this.subscriptionModel.findByPk(subscriptionId);
    if (!subscription) {
      throw new BadRequestException(
        `Subscription with ID "${subscriptionId}" does not exist`,
      );
    }
    const { amount, expiryDate } = this.computeAmountAndExpiry(
      subscription.amount ?? 0,
      plan,
    );

    // 3️⃣ Resolve the payer email. The JWT doesn't always carry it, so fall
    //     back to the user record — gateways (Paystack) require an email.
    let payerEmail = email;
    if (!payerEmail) {
      const user = await this.userModel.findByPk(userId, {
        attributes: ['id', 'email'],
      });
      payerEmail = user?.email ?? '';
    }
    if (!payerEmail) {
      throw new BadRequestException('User email is required to start a payment');
    }

    // 4️⃣ Ask the chosen gateway to create the transaction.
    const provider = input.provider ?? PaymentProvider.PAYSTACK;
    const gateway = this.gateways.get(provider);
    const init = await gateway.initialize({
      email: payerEmail,
      amountKobo: Math.round(amount * 100),
      method: input.method,
      metadata: { subscriptionId, userId, plan, ...(input.metadata ?? {}) },
    });

    // 5️⃣ Persist PENDING. A concurrent request with the same key hits the
    //     unique index; we swallow it and return the row that won the race.
    try {
      const txn = await this.txnModel.create({
        userId,
        subscriptionId,
        amount,
        plan,
        provider,
        paymentMethod: input.method ?? null,
        idempotencyKey: idempotencyKey ?? null,
        status: 'PENDING',
        reference: init.reference,
        authorizationUrl: init.authorizationUrl ?? null,
        expiryDate,
        metadata: init.raw ?? null,
      } as any);
      return this.toOutput(txn);
    } catch (error) {
      if (error instanceof UniqueConstraintError && idempotencyKey) {
        const winner = await this.txnModel.findOne({
          where: { userId, idempotencyKey },
        });
        if (winner) return this.toOutput(winner);
      }
      throw error;
    }
  }

  /**
   * Verify a reference with its gateway and settle the transaction. Idempotent:
   * PENDING transitions to PAID/FAILED exactly once; an already-PAID row is a
   * no-op (never re-extends access).
   */
  async confirm(userId: string, reference: string) {
    const txn = await this.txnModel.findOne({ where: { reference, userId } });
    if (!txn) throw new BadRequestException('Transaction not found');

    // Terminal states are returned untouched.
    if (txn.status !== 'PENDING') return txn;

    const result = await this.gateways.get(txn.provider).verify(reference);
    if (result.status === 'PAID') txn.status = 'PAID';
    else if (result.status === 'FAILED') txn.status = 'FAILED';
    // PENDING at the gateway → leave as-is for a later retry / webhook.

    if (txn.changed('status')) await txn.save();
    return txn;
  }

  /**
   * Handle a provider webhook. Signature is validated inside the gateway; we
   * only ever move a PENDING transaction forward, so at-least-once delivery is
   * safe to replay.
   */
  async handleWebhook(
    provider: PaymentProvider,
    headers: Record<string, any>,
    rawBody: Buffer | undefined,
    body: any,
  ) {
    const parsed = this.gateways.get(provider).parseWebhook(headers, rawBody, body);
    if (!parsed) return { message: 'Event ignored' };

    const txn = await this.txnModel.findOne({
      where: { reference: parsed.reference, status: 'PENDING' },
    });
    if (!txn) return { message: 'Transaction not pending or not found' };

    txn.status = parsed.status;
    await txn.save();
    return { message: 'Transaction updated' };
  }
}
