import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateXpRecordsDto {
  @ApiProperty({
    description: 'User ID for the XP record',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  userId: string;

  @ApiProperty({
    description: 'Previous XP value before update',
    example: 450,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  previousXpValue: number;

  @ApiProperty({
    description: 'Current XP value after update',
    example: 500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  currentXpValue: number;

  @ApiProperty({
    description: 'Description of the last XP transaction',
    example: 'Earned 50 XP for lesson completion',
  })
  @IsString()
  lastRecordDetail: string;

  @ApiProperty({
    description: 'Timestamp of last update',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  lastUpdatedAt: Date;
}

export class UpdateXpRecordsDto {
  @ApiPropertyOptional({
    description: 'Previous XP value before update',
    example: 450,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  previousXpValue?: number;

  @ApiPropertyOptional({
    description: 'Current XP value after update',
    example: 500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  currentXpValue?: number;

  @ApiPropertyOptional({
    description: 'Description of the last XP transaction',
    example: 'Earned 50 XP for lesson completion',
  })
  @IsString()
  @IsOptional()
  lastRecordDetail?: string;

  @ApiPropertyOptional({
    description: 'Timestamp of last update',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  lastUpdatedAt?: Date;
}

export class AddXpDto {
  @ApiProperty({
    description: 'Amount of XP to add',
    example: 50,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  xpValue: number;

  @ApiProperty({
    description: 'Description of how XP was earned',
    example: 'Completed Algebra Basics lesson',
  })
  @IsString()
  detail: string;
}

export class XpSummaryResponseDto {
  @ApiProperty({
    description: 'Type of XP',
    example: 'lesson_completion',
  })
  xpType: string;

  @ApiProperty({
    description: 'Total XP earned for this type',
    example: 500,
  })
  totalXp: number;
}

export class LeaderboardEntryDto {
  @ApiProperty({
    description: 'User information',
  })
  user: {
    id: string;
    username?: string;
    email?: string;
  };

  @ApiProperty({
    description: 'Current XP value',
    example: 1500,
  })
  currentXpValue: number;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  lastUpdatedAt: Date;
}
