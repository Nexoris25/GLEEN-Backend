import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { AirtimeNetwork } from '../models/xp-withdrawal-request.model';

export class CreateXpWithdrawalDto {
  @ApiProperty({ description: 'Amount of XP the user wants to withdraw' })
  @IsNumber()
  @Min(1)
  xpAmount: number;

  @ApiProperty({ description: 'Recipient phone number for the airtime' })
  @IsString()
  phone: string;

  @ApiProperty({
    enum: AirtimeNetwork,
    description: 'Recipient mobile network',
  })
  @IsEnum(AirtimeNetwork)
  network: AirtimeNetwork;
}
