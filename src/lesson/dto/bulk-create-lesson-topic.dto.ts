import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID, IsString, IsOptional, IsInt, Min, IsEnum, IsArray, ValidateNested, IsUrl } from 'class-validator';
import { TopicTypeEnum } from 'src/shared-types/FileTypeEnum';

export class LessonTopicItemDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ type: Number, example: 30 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  duration: number;

  @ApiProperty({
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

export class BulkCreateLessonTopicDto {
  @ApiProperty({ type: [LessonTopicItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonTopicItemDto)
  topics: LessonTopicItemDto[];
}
