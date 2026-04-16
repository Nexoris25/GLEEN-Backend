// verify-payment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ example: 'ref_abc123xyz' })
  @IsString()
  @IsNotEmpty()
  reference: string;
}
