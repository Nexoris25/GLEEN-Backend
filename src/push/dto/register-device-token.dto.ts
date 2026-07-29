import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterDeviceTokenDto {
  @ApiProperty({ description: 'FCM registration token from the device' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiPropertyOptional({ enum: ['ios', 'android', 'web'] })
  @IsOptional()
  @IsIn(['ios', 'android', 'web'])
  platform?: 'ios' | 'android' | 'web';
}

export class UnregisterDeviceTokenDto {
  @ApiProperty({ description: 'FCM token to remove' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
