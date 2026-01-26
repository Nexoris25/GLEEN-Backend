import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateV1BattleRecordDto {
  @ApiProperty({ type: String })
  @IsString()
  v1BattleId: string;

  @ApiProperty({ type: String })
  @IsString()
  userId: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  totalQuestions: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  totalAnsweredQuestions: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  totalUnansweredQuestions: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  correctAnswers: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  incorrectAnswers: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  totalMarks: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  obtainedMarks: number;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsDateString()
  @IsOptional()
  startedAt?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsDateString()
  @IsOptional()
  endedAt?: string;
}
