import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyTransactionDto {
  @ApiProperty({
    description: 'Paystack transaction reference',
    example: 'ref_7x9k2p3m4n5q',
  })
  @IsString()
  @IsNotEmpty()
  reference: string;
}
