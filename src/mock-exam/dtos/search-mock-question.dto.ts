//write search-quiz-question dto
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class SearchMockQuestionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly question?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  readonly mockExamId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  readonly userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  readonly limit?: number = 100;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  readonly offset?: number = 0;
}
