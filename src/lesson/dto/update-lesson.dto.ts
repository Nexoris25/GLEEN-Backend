import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateLessonDto } from './create-lesson.dto';

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Avatar or cover image (optional)',
  })
  @IsOptional()
  avatarOrCover?: any;
}
