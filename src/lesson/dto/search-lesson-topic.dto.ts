import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsUUID, IsNumber, Min } from 'class-validator';
import { FileTypeEnum } from 'src/shared-types/FileTypeEnum';

export class SearchLessonTopicDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  lessonId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  duration?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarOrCover?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoOrFileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoCaptionUrl?: string;

  @ApiPropertyOptional({ enum: FileTypeEnum })
  @IsOptional()
  fileType?: FileTypeEnum;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  limit: number = 10;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset: number = 0;
}
