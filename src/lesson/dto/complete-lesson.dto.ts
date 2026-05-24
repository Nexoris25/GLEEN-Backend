import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class CompleteLessonDto {
  @ApiProperty({
    description: 'Time spent on this lesson in seconds',
    example: 120,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  timeSpent?: number;
}

