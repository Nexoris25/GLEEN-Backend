import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { SubscriptionPlanEnum } from 'src/shared-types/subscription-plan.enum';

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
    description: 'Billing plan selected by the user',
  })
  @IsEnum(SubscriptionPlanEnum)
  plan: SubscriptionPlanEnum;

  @ApiPropertyOptional({
    example: { orderId: '123', product: 'Premium' },
    description: 'Optional metadata for the transaction',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
