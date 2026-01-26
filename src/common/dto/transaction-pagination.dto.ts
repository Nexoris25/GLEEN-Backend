// dto/transaction-pagination.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class TransactionPaginationDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by subscription ID',
  })
  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @ApiPropertyOptional({
    description: 'Filter by transaction reference',
  })
  @IsOptional()
  @IsString()
  reference?: string;
}
