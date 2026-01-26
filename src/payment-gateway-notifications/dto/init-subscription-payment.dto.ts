import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitSubscriptionPaymentDto {
  @ApiProperty()
  subscriptionId: string;

  @ApiProperty()
  amount: number;
}
