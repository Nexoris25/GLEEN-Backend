import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { SubscriptionPlanEnum } from 'src/shared-types/subscription-plan.enum';
import { PaymentProvider } from 'src/shared-types/payment-provider.enum';
import { PaymentMethod } from 'src/shared-types/payment-method.enum';

export class InitializePaymentDto {
  @ApiProperty({
    description: 'Subscription ID the user wants to pay for',
    format: 'uuid',
  })
  @IsUUID()
  subscriptionId: string;

  @ApiProperty({
    enum: SubscriptionPlanEnum,
    example: SubscriptionPlanEnum.MONTHLY,
    description: 'Billing cadence selected by the user',
  })
  @IsEnum(SubscriptionPlanEnum)
  plan: SubscriptionPlanEnum;

  @ApiPropertyOptional({
    enum: PaymentProvider,
    default: PaymentProvider.PAYSTACK,
    description: 'Processor that settles the charge (defaults to Paystack)',
  })
  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    description: 'Wallet / instrument the user picked (Apple Pay, Google Pay, Card)',
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional({
    example: { orderId: '123', product: 'Premium' },
    description: 'Optional metadata for the transaction',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
