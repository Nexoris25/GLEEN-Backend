import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class XpStatisticsQueryDto {
  @ApiPropertyOptional({ description: 'Start date for statistics', example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for statistics', example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class XpByActionDto {
  @ApiProperty()
  action: string;

  @ApiProperty()
  totalXp: number;
}

export class XpGraphPointDto {
  @ApiProperty({ description: 'XP value (X-axis)' })
  xp: number;

  @ApiProperty({ description: 'Date (Y-axis)' })
  date: string;
}

export class XpStatisticsResponseDto {
  @ApiProperty()
  totalXpIssued: number;

  @ApiProperty()
  averageXpPerUser: number;

  @ApiProperty({ type: [XpByActionDto] })
  xpByAction: XpByActionDto[];

  @ApiProperty({ type: [XpGraphPointDto] })
  xpOverTime: XpGraphPointDto[];
}
