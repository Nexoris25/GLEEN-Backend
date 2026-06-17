// lesson-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class LessonQueryDto {
  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ format: 'uuid', description: 'Optional UUID' })
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @ApiPropertyOptional({ description: 'Filter by  title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Filter by subtitle' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional({ description: 'Filter by description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class BrowseLessonsQueryDto {
  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by subject IDs (comma-separated UUIDs)',
    example: 'uuid1,uuid2',
  })
  @IsOptional()
  @IsString()
  subjects?: string;

  @ApiPropertyOptional({
    description: 'Search lessons',
    example: 'algebra',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by lesson type',
    enum: ['VIDEO', 'NON-VIDEO'],
    example: 'VIDEO',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsIn(['VIDEO', 'NON-VIDEO'])
  type?: 'VIDEO' | 'NON-VIDEO';
}

export class MostTakenQuizzesQueryDto {
  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Search quizzes (title/description)',
    example: 'algebra',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class QuizSubjectsQueryDto {
  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by subject IDs (comma-separated UUIDs)',
    example: 'uuid1,uuid2',
  })
  @IsOptional()
  @IsString()
  subjects?: string;

  @ApiPropertyOptional({
    description: 'Search subjects',
    example: 'math',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
