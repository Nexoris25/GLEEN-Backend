/**
 * How the user chose to pay. This is the wallet / instrument shown in the app;
 * it settles through a `PaymentProvider` (currently Paystack). Used to render
 * the right checkout channel and to display the method on receipts / history.
 */
export enum PaymentMethod {
  CARD = 'CARD',
  APPLE_PAY = 'APPLE_PAY',
  GOOGLE_PAY = 'GOOGLE_PAY',
}
