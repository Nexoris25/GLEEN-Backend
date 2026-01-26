import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
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
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { PaystackService } from '../services/paystack.service';
import { InitializePaymentDto } from '../dto/initialize-payment.dto';
import { VerifyTransactionDto } from '../dto/verify-transaction.dto';
import { RawBodyRequest } from '@nestjs/common';
import * as crypto from 'crypto';
import { SubscriptionPlanEnum } from '../../shared-types/subscription-plan.enum';

@ApiTags('Payments (Paystack)')
@Controller('paystack')
export class PaystackController {
  constructor(private readonly paystackService: PaystackService) {}

  // -----------------------
  // 1️⃣ Initialize Payment
  // -----------------------
  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Initialize Paystack Subscription Payment',
    description:
      'Starts a new transaction and saves it as PENDING. Returns the authorization_url and reference.',
  })
  @ApiBody({ type: InitializePaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Transaction initialized successfully',
    schema: {
      example: {
        status: 'success',
        data: {
          authorizationUrl: 'https://checkout.paystack.com/... ',
          reference: 'ref_7x9k2p3m4n5q',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input or failed initialization' })
  async initialize(
    @Body() dto: InitializePaymentDto,
    @Req() req,
  ) {
    const { subscriptionId, plan } = dto;

    if (!subscriptionId || !plan) {
      throw new UnauthorizedException('Subscription ID or plan missing');
    }
    // ✅ Call PaystackService directly
    const result = await this.paystackService.initializeTransaction(
      req.user.email,
      plan as SubscriptionPlanEnum,
      req.user.id,
      subscriptionId,
    );

    return { status: 'success', data: result };
  }

  // -----------------------
  // 2️⃣ Verify Payment (frontend polling)
  // -----------------------
  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify Paystack Transaction',
    description: 'Verifies payment status using the transaction reference.',
  })
  @ApiResponse({ status: 200, description: 'Payment verified' })
  @ApiResponse({ status: 400, description: 'Invalid reference or payment failed' })
  async verify(@Body() body: VerifyTransactionDto) {
    const data = await this.paystackService.verifyTransaction(body.reference);
    return { status: 'success', data };
  }

  // -----------------------
  // 3️⃣ Webhook (internal, hidden from Swagger)
  // -----------------------
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  @ApiConsumes('application/json')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res,
  ) {
    try {
      const signature = req.headers['x-paystack-signature'] as string;
      const secret = process.env.PAYSTACK_SECRET_KEY;

      // Verify Paystack signature
      const hash = crypto
        .createHmac('sha512', secret)
        .update(req.rawBody)
        .digest('hex');

      if (hash !== signature) {
        throw new UnauthorizedException('Invalid Paystack signature');
      }

      // Process webhook (PaystackService will update DB)
      await this.paystackService.processWebhook(req.body); // you may need to add processWebhook to PaystackService

      return res.status(HttpStatus.OK).send('Webhook received');
    } catch (error) {
      console.error('Paystack webhook error:', error);
      return res.status(HttpStatus.BAD_REQUEST).send('Webhook processing failed');
    }
  }
}
