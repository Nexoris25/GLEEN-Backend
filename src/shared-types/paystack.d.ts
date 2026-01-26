declare module 'paystack' {
  interface PaystackResponse<T = any> {
    status: boolean;
    message: string;
    data: T;
  }

  interface InitializeTransactionPayload {
    email: string;
    amount: number;
    reference?: string;
    callback_url?: string;
    metadata?: Record<string, any>;
  }

  interface TransactionAPI {
    initialize(
      payload: InitializeTransactionPayload,
    ): Promise<PaystackResponse<{
      authorization_url: string;
      access_code: string;
      reference: string;
    }>>;

    verify(
      reference: string,
    ): Promise<PaystackResponse<{
      status: 'success' | 'failed' | 'abandoned';
      reference: string;
      amount: number;
      paid_at: string;
      channel: string;
      currency: string;
      customer: {
        email: string;
      };
    }>>;
  }

  interface PaystackClient {
    transaction: TransactionAPI;
  }

  function Paystack(secretKey: string): PaystackClient;

  export = Paystack;
}
