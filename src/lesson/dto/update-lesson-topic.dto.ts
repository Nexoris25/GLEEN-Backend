import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateLessonTopicDto } from './create-lesson-topic.dto';
import { FileTypeEnum } from 'src/shared-types/FileTypeEnum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
/**
 * Update DTO
 * - status is NOT updatable
 * - lessonId is NOT updatable
 */
export class UpdateLessonTopicDto extends PartialType(
  OmitType(CreateLessonTopicDto, ['lessonId'] as const),
) {}
