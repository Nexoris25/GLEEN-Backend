import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiExcludeEndpoint,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RawBodyRequest } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { PaymentsService } from '../services/payments.service';
import { InitializePaymentDto } from '../dto/initialize-payment.dto';
import { VerifyTransactionDto } from '../dto/verify-transaction.dto';
import { PaymentProvider } from '../../shared-types/payment-provider.enum';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // -----------------------
  // Initialize (provider-agnostic, idempotent)
  // -----------------------
  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Initialize a subscription payment',
    description:
      'Creates a PENDING transaction and returns the checkout URL + reference. ' +
      'Pass an Idempotency-Key header to make retries safe.',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Client-generated key; the same key returns the same result.',
  })
  @ApiBody({ type: InitializePaymentDto })
  @ApiResponse({ status: 200, description: 'Transaction initialized' })
  async initialize(
    @Body() dto: InitializePaymentDto,
    @Headers('idempotency-key') idempotencyKey: string,
    @Req() req,
  ) {
    const data = await this.paymentsService.initialize(
      req.user.id,
      req.user.email,
      dto,
      idempotencyKey,
    );
    return { status: 'success', data };
  }

  // -----------------------
  // Confirm / verify (frontend polling, idempotent)
  // -----------------------
  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Confirm a payment by reference',
    description: 'Verifies with the gateway and settles the transaction once.',
  })
  @ApiResponse({ status: 200, description: 'Payment confirmed' })
  async confirm(@Body() body: VerifyTransactionDto, @Req() req) {
    const txn = await this.paymentsService.confirm(req.user.id, body.reference);
    return { status: 'success', data: txn };
  }

  // -----------------------
  // Webhook (public, per-provider; signature verified in the gateway)
  // -----------------------
  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async webhook(
    @Param('provider') provider: string,
    @Req() req: RawBodyRequest<Request>,
    @Res() res,
  ) {
    try {
      const result = await this.paymentsService.handleWebhook(
        provider.toUpperCase() as PaymentProvider,
        req.headers as Record<string, any>,
        req.rawBody,
        req.body,
      );
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error('Payment webhook error:', error);
      return res.status(HttpStatus.BAD_REQUEST).send('Webhook processing failed');
    }
  }
}
