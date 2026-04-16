import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { TopicTypeEnum } from 'src/shared-types/FileTypeEnum';

export class BulkUpdateLessonTopicItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  id: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ type: Number, example: 30 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  duration?: number;

  @ApiPropertyOptional({
    enum: TopicTypeEnum,
    example: TopicTypeEnum.VIDEO,
    description: 'Type of the topic',
  })
  @IsEnum(TopicTypeEnum)
  @IsOptional()
  topicType?: TopicTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mainContent?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Avatar image URL (optional)',
  })
  @IsOptional()
  @IsString()
  avatarOrCover?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Video or file URL (optional)',
  })
  @IsOptional()
  @IsString()
  videoOrFileUrl?: string;

  @ApiPropertyOptional({
    type: 'string',
    description: 'Video caption URL (optional)',
  })
  @IsOptional()
  @IsString()
  videoCaptionUrl?: string;
}

export class BulkUpdateLessonTopicDto {
  @ApiProperty({ type: [BulkUpdateLessonTopicItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateLessonTopicItemDto)
  topics: BulkUpdateLessonTopicItemDto[];
}

