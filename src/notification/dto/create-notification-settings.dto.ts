import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

/**
 * All fields are optional so the client can persist a single toggle at a time.
 * Decorators are REQUIRED here: the global ValidationPipe uses `whitelist` +
 * `forbidNonWhitelisted`, which rejects any property that lacks a validator.
 */
export class CreateNotificationSettingsDto {
  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  userNotification?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  emailNotification?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  appNotification?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  pushNotification?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  soundNotification?: boolean;

  @ApiPropertyOptional({ type: Boolean, description: 'Alerts for new peer messages' })
  @IsOptional()
  @IsBoolean()
  newMessages?: boolean;

  @ApiPropertyOptional({ type: Boolean, description: 'Crew activity updates' })
  @IsOptional()
  @IsBoolean()
  crewUpdates?: boolean;

  @ApiPropertyOptional({ type: Boolean, description: 'App feature/update news' })
  @IsOptional()
  @IsBoolean()
  appUpdates?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Weekly parent email/SMS reporting',
  })
  @IsOptional()
  @IsBoolean()
  parentsReporting?: boolean;

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
