import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { XP_MULTIPLIER_KEYS } from '../constants/xp-multiplier-keys';

export class UpdateXpMultiplierDto {
  @ApiProperty({ description: 'Multiplier key (selected XP item)' })
  @IsString()
  @IsIn(XP_MULTIPLIER_KEYS)
  key: string;

  @ApiProperty({ description: 'Multiplier value', example: 2 })
  @IsNumber()
  @Min(0)
  multiplierValue: number;

  @ApiProperty({ description: 'Multiplier duration in days', example: 7 })
  @IsInt()
  @Min(1)
  days: number;

  @ApiPropertyOptional({
    description: 'Multiplier start datetime (defaults to now)',
    example: '2026-04-14T12:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startAt?: string;

  @ApiPropertyOptional({ description: 'Multiplier name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Multiplier details' })
  @IsString()
  @IsOptional()
  details?: string;

  @ApiPropertyOptional({
    description: 'Enable/disable multiplier (defaults to true)',
  })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
