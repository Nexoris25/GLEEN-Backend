import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { MetricsScope } from '../enums/metrics-scope.enum';
import { MetricsPeriod } from '../enums/metrics-period.enum';

export class MetricsQueryDto {
  @ApiPropertyOptional({ enum: MetricsScope })
  @IsOptional()
  @IsEnum(MetricsScope)
  scope?: MetricsScope;

  @ApiPropertyOptional({ enum: MetricsPeriod })
  @IsOptional()
  @IsEnum(MetricsPeriod)
  period?: MetricsPeriod;

  @ApiPropertyOptional({ description: 'Filter by class ID' })
  @IsOptional()
  @IsUUID()
  classId?: string;
}
