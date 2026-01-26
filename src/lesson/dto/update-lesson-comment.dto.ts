import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
export class UpdateLessonCommentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  lessonId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rating: number;
}