//write update-quiz-question.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
export class UpdateMockQuestionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  mockExamId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  question: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'THEORY'] })
  @IsOptional()
  @IsString()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject({ each: true })
  options?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  correctAnswer: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  file: string;
}
