/**
 * Payment processor that actually settles the charge.
 *
 * Wallet payment methods (Apple Pay / Google Pay) are NOT providers — they are
 * `PaymentMethod`s that settle through one of these providers. Add STRIPE,
 * APP_STORE, PLAY_BILLING, etc. here and register a matching gateway to support
 * another processor without touching the orchestration layer.
 */
export enum PaymentProvider {
  PAYSTACK = 'PAYSTACK',
}
