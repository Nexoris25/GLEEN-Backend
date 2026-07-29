import { PaymentProvider } from '../../shared-types/payment-provider.enum';
import { PaymentMethod } from '../../shared-types/payment-method.enum';

export interface InitializeParams {
  email: string;
  /** Charge amount already converted to the smallest currency unit (kobo). */
  amountKobo: number;
  /** Wallet / instrument the user picked; maps to a gateway checkout channel. */
  method?: PaymentMethod;
  /** Free-form context forwarded to the gateway (subscriptionId, userId, plan…). */
  metadata?: Record<string, any>;
}

export interface InitializeResult {
  /** Hosted-checkout URL the client opens (Paystack). Absent for token flows. */
  authorizationUrl?: string;
  /** Gateway transaction reference we persist and later verify against. */
  reference: string;
  /** Raw gateway response, stored for debugging / reconciliation. */
  raw?: Record<string, any>;
}

/** Normalised payment state shared across gateways. */
export type PaymentStatus = 'PAID' | 'FAILED' | 'PENDING';

export interface VerifyResult {
  status: PaymentStatus;
  reference: string;
  raw?: Record<string, any>;
}

/**
 * A payment processor. Implementations only talk to the PSP and validate its
 * signatures — they never touch the database. Orchestration + idempotency live
 * in PaymentsService, so adding a new provider is a self-contained class.
 */
export interface PaymentGateway {
  readonly provider: PaymentProvider;

  /** Create a transaction at the gateway and return a reference (+ checkout URL). */
  initialize(params: InitializeParams): Promise<InitializeResult>;

  /** Ask the gateway for the current state of a reference. */
  verify(reference: string): Promise<VerifyResult>;

  /**
   * Validate an inbound webhook (signature check) and normalise it.
   * Returns null when the event is unrelated / should be ignored.
   */
  parseWebhook(
    headers: Record<string, any>,
    rawBody: Buffer | undefined,
    body: any,
  ): VerifyResult | null;
}
