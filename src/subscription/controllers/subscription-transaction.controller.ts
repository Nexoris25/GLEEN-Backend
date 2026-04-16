import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SubscriptionTransactionService } from '../services/subscription-transaction.service';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TransactionPaginationDto } from 'src/common/dto/transaction-pagination.dto';
import { SubscriptionQueryDto } from '../dto/subscription-query.dto';

@ApiTags('Subscription Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subscription-transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionTransactionController {
  constructor(private readonly txnService: SubscriptionTransactionService) {}

  @Get('paid')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'List PAID subscription transactions, admin and super admin',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async paid(@Query() pagination?: PaginationDto) {
    return {
      status: HttpStatus.OK,
      data: await this.txnService.findPaid(),
    };
  }

  @Get('pending')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'List PENDING subscription transactions, admin and super admin',
  })
  async pending() {
    return {
      status: HttpStatus.OK,
      data: await this.txnService.findPending(),
    };
  }

  @Get('failed')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'List FAILED subscription transactions, admin and super admin',
  })
  async failed() {
    return {
      status: HttpStatus.OK,
      data: await this.txnService.findFailed(),
    };
  }

  @Get('abandoned')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary:
      'List ABANDONED subscription transactions (pending > 30 mins), admin and super admin',
  })
  async abandoned() {
    return {
      status: HttpStatus.OK,
      data: await this.txnService.findAbandoned(),
    };
  }

  @Get('transactions')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary:
      'Get subscription transactions (optional filters). admin, super admin',
  })
  @ApiQuery({ name: 'subscriptionId', required: false })
  @ApiQuery({ name: 'reference', required: false })
  async findTransactions(@Query() query: TransactionPaginationDto) {
    const { subscriptionId, reference, limit, offset } = query;

    return this.txnService.findBySubscriptionOrReference(
      subscriptionId,
      reference,
      { limit, offset },
    );
  }

  // old

  /*
    // ✅ Create transaction
    @Post()
    @ApiOperation({ summary: 'Create a new subscription transaction' })
    @ApiBody({ type: CreateSubscriptionTransactionDto })
    async create(@Body() dto: CreateSubscriptionTransactionDto, @UserId() userId: string) {
        const txn = await this.txnService.create(dto, userId);
        return { status: HttpStatus.CREATED, message: 'Transaction created successfully', data: txn };
    }
*/
  // ✅ Get logged-in user transactions
  @Get('me')
  @ApiOperation({
    summary:
      'Get subscription transactions for logged-in user; ?current=true returns active subscription',
  })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'current', required: false, type: Boolean, example: true })
  async findAll(
    @UserId() userId: string,
    @Query() query: SubscriptionQueryDto,
    //@Query('offset') offset?: number,
    // @Query('limit') limit?: number,
    // @Query('current') current?: string,
  ) {
    const { current, offset, limit } = query;
    // ?current=true → latest active
    if (current === 'true') {
      const latest = await this.txnService.findLatestByUser(userId);
      return {
        status: HttpStatus.OK,
        message: 'Latest transaction fetched successfully',
        data: latest,
      };
    }

    // No pagination → all rows
    if (offset === undefined && limit === undefined) {
      const all = await this.txnService.findAllByUser(userId);
      return {
        status: HttpStatus.OK,
        message: 'All transactions fetched successfully',
        data: all,
      };
    }

    // Paginated
    const result = await this.txnService.findByUser(
      userId,
      offset ?? 0,
      limit ?? 10,
    );

    return {
      status: HttpStatus.OK,
      message: 'Transactions fetched successfully',
      data: result,
    };
  }
}
