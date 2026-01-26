import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMockExamRecordDto {
  @ApiProperty()
  @IsUUID()
  mockExamId: string;

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
}
