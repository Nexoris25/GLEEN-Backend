import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, IsNumber, IsOptional } from 'class-validator';

export class SearchV1BattleQuestionAnswersDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    quizQuestionId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    vOneBattleId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    userId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    score?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    answer?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    offset?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    limit?: number;
}
