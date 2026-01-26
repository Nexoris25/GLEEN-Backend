import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateXpLogDto {
  @ApiProperty({
    description: 'User ID who earned the XP',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID('4')
  userId: string;

  @ApiProperty({
    description: 'Amount of XP earned',
    example: 50,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  xpValue: number;

  @ApiProperty({
    description: 'Type of XP earned',
    example: 'lesson_completion',
    examples: [
      'lesson_completion',
      'quiz_completion', 
      'mock_exam',
      'v1_battle',
      'referral',
      'daily_login',
      'achievement'
    ]
  })
  @IsString()
  xpType: string;

  @ApiProperty({
    description: 'Detailed description of how XP was earned',
    example: 'Completed Algebra Basics lesson (45 minutes)'
  })
  @IsString()
  detail: string;
}

export class UpdateXpLogDto {
  @ApiPropertyOptional({
    description: 'Amount of XP earned',
    example: 50,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  xpValue?: number;

  @ApiPropertyOptional({
    description: 'Type of XP earned',
    example: 'lesson_completion',
    examples: [
      'lesson_completion',
      'quiz_completion',
      'mock_exam',
      'v1_battle', 
      'referral',
      'daily_login',
      'achievement'
    ]
  })
  @IsString()
  @IsOptional()
  xpType?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of how XP was earned',
    example: 'Completed Algebra Basics lesson (45 minutes)'
  })
  @IsString()
  @IsOptional()
  detail?: string;
}

export class XpLogQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by XP type',
    example: 'lesson_completion'
  })
  @IsString()
  @IsOptional()
  xpType?: string;

  @ApiPropertyOptional({
    description: 'Filter by date range (start date)',
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by date range (end date)',
    example: '2024-01-31T23:59:59.999Z'
  })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}

export class LeaderboardQueryDto {
  @ApiPropertyOptional({
    description: 'Number of top users to return',
    example: 10,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}