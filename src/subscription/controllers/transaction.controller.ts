import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { TransactionService } from '../services/transaction.service';

@ApiTags('Subscription Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
  ) {}

  @Get('user/:userId')
  @ApiParam({ name: 'userId', type: String })
  async getUserTransactions(@Param('userId') userId: string) {
    return this.transactionService.findByUserId(userId);
  }
}
