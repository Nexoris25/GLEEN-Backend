import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { DeviceTokenService } from '../services/device-token.service';
import {
  RegisterDeviceTokenDto,
  UnregisterDeviceTokenDto,
} from '../dto/register-device-token.dto';

@ApiTags('Push / Device Tokens')
@ApiBearerAuth()
@Controller('device-tokens')
export class DeviceTokenController {
  constructor(private readonly deviceTokenService: DeviceTokenService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register this device for push notifications' })
  async register(
    @UserId() userId: string,
    @Body() dto: RegisterDeviceTokenDto,
  ) {
    await this.deviceTokenService.register(userId, dto.token, dto.platform);
    return { status: HttpStatus.OK, message: 'Device registered' };
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unregister a device token (e.g. on logout)' })
  async unregister(@Body() dto: UnregisterDeviceTokenDto) {
    await this.deviceTokenService.remove(dto.token);
    return { status: HttpStatus.OK, message: 'Device unregistered' };
  }
}
