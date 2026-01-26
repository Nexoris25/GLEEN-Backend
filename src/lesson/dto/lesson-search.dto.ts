import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class LessonSearchDto {

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    subjectId?: string;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    userId?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    subtitle?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    mainContent?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    videoOrFileUrl?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    avatarOrCover?: string;

    @ApiPropertyOptional()
    @IsOptional()
    publishedAt?: Date;

    @ApiPropertyOptional()
    @IsOptional()
    fileType?: string;

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