import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class RequestPrivateLessonDto {
  @ApiProperty({ description: 'Tutor userId (UUID)' })
  @IsUUID()
  tutorId: string;

  @ApiProperty({
    example: '2026-01-10',
    description: 'Scheduled date (YYYY-MM-DD)',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: '10:00',
    description: 'Scheduled time (HH:mm, 24h)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'time must be in HH:mm (24h) format',
  })
  time: string;

  @ApiPropertyOptional({
    example: 60,
    description: 'Duration in minutes (default: 60)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(15)
  @Max(240)
  durationMinutes?: number;
}
