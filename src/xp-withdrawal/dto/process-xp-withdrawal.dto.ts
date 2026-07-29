import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsString, ValidateIf, IsNotEmpty } from 'class-validator';
import { WithdrawalStatus } from '../models/xp-withdrawal-request.model';

/** Admin action on a pending withdrawal: mark it SENT or DECLINED. */
export class ProcessXpWithdrawalDto {
  @ApiProperty({
    enum: [WithdrawalStatus.SENT, WithdrawalStatus.DECLINED],
    description: 'Outcome of processing the request',
  })
  @IsIn([WithdrawalStatus.SENT, WithdrawalStatus.DECLINED])
  status: WithdrawalStatus.SENT | WithdrawalStatus.DECLINED;

  @ApiPropertyOptional({
    description: 'Required when declining — shown to the user',
  })
  @ValidateIf((o) => o.status === WithdrawalStatus.DECLINED)
  @IsString()
  @IsNotEmpty()
  declineReason?: string;
}
