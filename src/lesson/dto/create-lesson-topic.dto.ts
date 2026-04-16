import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsUUID,
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { TopicTypeEnum } from 'src/shared-types/FileTypeEnum';

export class CreateLessonTopicDto {
  @ApiProperty()
  @IsUUID()
  lessonId: string;

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
  @IsOptional() // optional because we have a default in the model
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
    format: 'binary', // ⚡ tells Swagger this is a file
    description: 'Avatar image file (optional)',
  })
  @IsOptional()
  avatarOrCover?: any; // ⚡ must be any for multer file

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary', // ⚡ tells Swagger this is a file
    description: 'Avatar image file (optional)',
  })
  @IsOptional()
  videoOrFileUrl?: any; // ⚡ must be any for multer file

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary', // ⚡ tells Swagger this is a file
    description: 'Avatar image file (optional)',
  })
  @IsOptional()
  videoCaptionUrl?: any; // ⚡ must be any for multer file
}
