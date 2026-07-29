import {
  Controller,
  Post,
  Body,
  Req,
  Res,
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
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RawBodyRequest } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { PaymentsService } from '../services/payments.service';
import { InitializePaymentDto } from '../dto/initialize-payment.dto';
import { VerifyTransactionDto } from '../dto/verify-transaction.dto';
import { PaymentProvider } from '../../shared-types/payment-provider.enum';

/**
 * Legacy Paystack-specific routes. Kept for back-compat; every handler now
 * delegates to the provider-agnostic PaymentsService so they share the same
 * idempotent behaviour as `/payments/*`. Prefer the `/payments/*` endpoints.
 */
@ApiTags('Payments (Paystack)')
@Controller('paystack')
export class PaystackController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize Paystack Subscription Payment (legacy)' })
  @ApiBody({ type: InitializePaymentDto })
  @ApiResponse({ status: 200, description: 'Transaction initialized successfully' })
  async initialize(
    @Body() dto: InitializePaymentDto,
    @Headers('idempotency-key') idempotencyKey: string,
    @Req() req,
  ) {
    const data = await this.paymentsService.initialize(
      req.user.id,
      req.user.email,
      { ...dto, provider: PaymentProvider.PAYSTACK },
      idempotencyKey,
    );
    return { status: 'success', data };
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Paystack Transaction (legacy)' })
  @ApiResponse({ status: 200, description: 'Payment verified' })
  async verify(@Body() body: VerifyTransactionDto, @Req() req) {
    const data = await this.paymentsService.confirm(req.user.id, body.reference);
    return { status: 'success', data };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  @ApiConsumes('application/json')
  async webhook(@Req() req: RawBodyRequest<Request>, @Res() res) {
    try {
      await this.paymentsService.handleWebhook(
        PaymentProvider.PAYSTACK,
        req.headers as Record<string, any>,
        req.rawBody,
        req.body,
      );
      return res.status(HttpStatus.OK).send('Webhook received');
    } catch (error) {
      console.error('Paystack webhook error:', error);
      return res.status(HttpStatus.BAD_REQUEST).send('Webhook processing failed');
    }
  }
}
