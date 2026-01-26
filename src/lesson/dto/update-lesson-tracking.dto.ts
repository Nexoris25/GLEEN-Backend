//write the dto for updating lesson tracking
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateLessonTrackingDto } from './create-lesson-tracking.dto';

export class UpdateLessonTrackingDto extends PartialType(CreateLessonTrackingDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  lessonId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId: string;
}