//write quiz questions dto
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class QuizQuestionOptionDto {
  @ApiProperty({ description: 'Unique key for the option (e.g., "A", "B")' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'Text content of the option' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({ description: 'Optional image URL for the option' })
  @IsOptional()
  @IsString()
  image?: string;
}

export class CreateQuizQuestionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  quizId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({
    enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'THEORY'],
    example: 'MULTIPLE_CHOICE',
  })
  @IsNotEmpty()
  @IsString()
  type: string;

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

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  correctAnswer: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  file: string;
}
