import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentProvider } from '../../shared-types/payment-provider.enum';
import { PaymentGateway } from './payment-gateway.interface';
import { PaystackGateway } from './paystack.gateway';

/**
 * Resolves a `PaymentProvider` to its gateway implementation. Register new
 * gateways here (and in the module providers) — nothing else in the payment
 * flow needs to know which processor is in use.
 */
@Injectable()
export class PaymentGatewayRegistry {
  private readonly gateways = new Map<PaymentProvider, PaymentGateway>();

  constructor(paystack: PaystackGateway) {
    this.register(paystack);
  }

  private register(gateway: PaymentGateway) {
    this.gateways.set(gateway.provider, gateway);
  }

  get(provider: PaymentProvider): PaymentGateway {
    const gateway = this.gateways.get(provider);
    if (!gateway) {
      throw new BadRequestException(
        `No payment gateway registered for provider "${provider}"`,
      );
    }
    return gateway;
  }
}
