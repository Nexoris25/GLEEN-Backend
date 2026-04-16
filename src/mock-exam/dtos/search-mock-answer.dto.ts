// write search-mock-answer dto
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class SearchMockAnswerDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  mockQuestionId?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mockExamRecordId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  answer?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  limit?: number = 100;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  offset?: number = 0;
}
