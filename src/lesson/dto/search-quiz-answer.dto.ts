// write search-quiz-answer dto
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class SearchQuizAnswerDto {

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    userId?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    quizQuestionId?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    quizRecordId: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    answer?: string;

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