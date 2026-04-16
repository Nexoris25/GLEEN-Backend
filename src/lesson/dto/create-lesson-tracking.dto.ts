//write crate-lesson-tracking.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
export class CreateLessonTrackingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  lessonId: string;
}
