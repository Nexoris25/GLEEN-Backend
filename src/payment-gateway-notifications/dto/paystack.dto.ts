// src/paystack/dto/initialize-payment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class InitializePaymentDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Customer email address (required by Paystack)',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 5000,
    description: 'Amount in Naira (will be converted to kobo internally ×100)',
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    required: false,
    example: { orderId: 'ORD-12345', userId: 'uuid-here', plan: 'premium' },
    description: 'Optional metadata to attach to the transaction',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}