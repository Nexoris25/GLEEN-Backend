import { IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateV1BattleRecordDto {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  totalQuestions?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  totalAnsweredQuestions?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  totalUnansweredQuestions?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  correctAnswers?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  incorrectAnswers?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  totalMarks?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  obtainedMarks?: number;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  endedAt?: string;
}
