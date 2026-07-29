import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Paystack from 'paystack';
import * as crypto from 'crypto';
import { PaymentProvider } from '../../shared-types/payment-provider.enum';
import { PaymentMethod } from '../../shared-types/payment-method.enum';
import {
  InitializeParams,
  InitializeResult,
  PaymentGateway,
  VerifyResult,
} from './payment-gateway.interface';

/**
 * Paystack processor. Apple Pay / Google Pay are rendered by Paystack's hosted
 * checkout as `channels`; we settle everything through Paystack (₦).
 */
/**
 * Placeholder secret used only when PAYSTACK_SECRET_KEY isn't configured, so the
 * app can still boot in dev. It is NOT a live key — real charges/verification
 * will fail until a real key is set in the environment. Replace before prod.
 */
const FALLBACK_SECRET_KEY = 'sk_test_0000000000000000000000000000000000000000';

@Injectable()
export class PaystackGateway implements PaymentGateway {
  readonly provider = PaymentProvider.PAYSTACK;
  private readonly paystack: any;
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    const secretKey =
      this.configService.get<string>('PAYSTACK_SECRET_KEY') ||
      process.env.PAYSTACK_SECRET_KEY ||
      FALLBACK_SECRET_KEY;

    if (secretKey === FALLBACK_SECRET_KEY) {
      console.warn(
        '[PaystackGateway] PAYSTACK_SECRET_KEY is missing — using a placeholder key. ' +
          'Payments will not actually settle until a real key is configured.',
      );
    }

    this.secretKey = secretKey;
    // Paystack is a factory function — do NOT use `new`.
    this.paystack = Paystack(secretKey);
  }

  /** Map our instrument to the Paystack checkout channels to offer. */
  private channelsFor(method?: PaymentMethod): string[] | undefined {
    switch (method) {
      case PaymentMethod.APPLE_PAY:
        return ['apple_pay'];
      // Google Pay settles as a card token through Paystack checkout.
      case PaymentMethod.GOOGLE_PAY:
      case PaymentMethod.CARD:
        return ['card'];
      default:
        return undefined; // let Paystack show every enabled channel
    }
  }

  async initialize(params: InitializeParams): Promise<InitializeResult> {
    const channels = this.channelsFor(params.method);
    try {
      const response = await this.paystack.transaction.initialize({
        email: params.email,
        amount: params.amountKobo,
        metadata: params.metadata,
        ...(channels ? { channels } : {}),
      });

      if (!response.status) {
        throw new Error(response.message || 'Initialization failed');
      }

      return {
        authorizationUrl: response.data.authorization_url,
        reference: response.data.reference,
        raw: response.data,
      };
    } catch (error: any) {
      console.error('Paystack initialize error:', error);
      throw new BadRequestException(
        error.message || 'Failed to initialize Paystack transaction',
      );
    }
  }

  async verify(reference: string): Promise<VerifyResult> {
    try {
      const response = await this.paystack.transaction.verify(reference);
      if (!response.status) {
        throw new Error('Verification failed');
      }
      return {
        status: this.normalise(response.data.status),
        reference,
        raw: response.data,
      };
    } catch (error: any) {
      console.error('Paystack verify error:', error);
      throw new BadRequestException('Transaction verification failed');
    }
  }

  parseWebhook(
    headers: Record<string, any>,
    rawBody: Buffer | undefined,
    body: any,
  ): VerifyResult | null {
    const signature = headers['x-paystack-signature'] as string;
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(rawBody ?? Buffer.from(JSON.stringify(body)))
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid Paystack signature');
    }

    const reference = body?.data?.reference;
    if (!reference) return null;

    switch (body.event) {
      case 'charge.success':
        return { status: 'PAID', reference, raw: body.data };
      case 'charge.failed':
      case 'charge.cancelled':
        return { status: 'FAILED', reference, raw: body.data };
      default:
        return null; // event we don't act on
    }
  }

  private normalise(status: string): VerifyResult['status'] {
    if (status === 'success') return 'PAID';
    if (status === 'failed' || status === 'abandoned') return 'FAILED';
    return 'PENDING';
  }
}
