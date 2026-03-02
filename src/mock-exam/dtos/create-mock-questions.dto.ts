//write quiz questions dto
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateMockQuestionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  mockExamId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'THEORY'] })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject({ each: true })
  options?: any[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  correctAnswer: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  file: string;
}

export class CreateMockQuestionWithoutMockIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'THEORY'] })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject({ each: true })
  options?: any[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  correctAnswer: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  file: string;
}

export class CreateBulkMockQuestionDto {
  @ApiProperty({ type: [CreateMockQuestionWithoutMockIdDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMockQuestionWithoutMockIdDto)
  questions: CreateMockQuestionWithoutMockIdDto[];
}
