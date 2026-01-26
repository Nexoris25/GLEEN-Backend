import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBooleanString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SubscriptionQueryDto {
  @ApiPropertyOptional({
    description: 'Return only current active subscription',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBooleanString()
  current?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
