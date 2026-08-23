import {
  Controller,
  Post,
  Req,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request } from 'express';
import { ClassesService } from '../services/classes.service';

// No JWT guard — Daily.co calls this from their servers.
@ApiExcludeController()
@Controller('classes')
export class DailyWebhookController {
  constructor(private readonly classesService: ClassesService) {}

  @Post('daily-webhook')
  @HttpCode(HttpStatus.OK)
  async handleDailyWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('x-webhook-timestamp') timestamp: string,
    @Headers('x-webhook-signature') signature: string,
  ) {
    const rawBody =
      (req as any).rawBody ?? Buffer.from(JSON.stringify(req.body));
    await this.classesService.handleDailyWebhook(
      rawBody,
      timestamp,
      signature,
      req.body,
    );
    return { ok: true };
  }
}
