//write update-quiz-question.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { QuizQuestionOptionDto } from './create-quiz-question.dto';

export class UpdateQuizQuestionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  quizId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  question: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({
    enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'THEORY'],
    example: 'MULTIPLE_CHOICE',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    example: 'PENDING',
  })
  @IsOptional()
  @IsString()
  status: string = 'PENDING';

  @ApiPropertyOptional({ type: [QuizQuestionOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionOptionDto)
  options?: QuizQuestionOptionDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  correctAnswer: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  file: string;
}

export class UpdateBulkQuizQuestionItemDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({
    enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'THEORY'],
    example: 'MULTIPLE_CHOICE',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    example: 'PENDING',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ type: [QuizQuestionOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionOptionDto)
  options?: QuizQuestionOptionDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  file?: string;
}

export class UpdateBulkQuizQuestionDto {
  @ApiProperty({ type: [UpdateBulkQuizQuestionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBulkQuizQuestionItemDto)
  questions: UpdateBulkQuizQuestionItemDto[];
}
