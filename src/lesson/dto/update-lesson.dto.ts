import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateLessonDto } from './create-lesson.dto';

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  @ApiPropertyOptional({
    description: 'Avatar or cover image URL (optional)',
  })
  @IsOptional()
  @IsString()
  avatarOrCover?: string;
}
