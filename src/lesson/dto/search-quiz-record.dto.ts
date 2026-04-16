import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SearchQuizRecordDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  quizId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalMarks?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  obtainedMarks?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalQuestions?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalAnsweredQuestions?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalUnansweredQuestions?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  correctAnswers?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  incorrectAnswers?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  endedAt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  startedAt?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  limit: number = 10;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset: number = 0;
}
