import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateV1BattleDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    duration?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    questionCount?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    winnerXP?: number;

    @ApiPropertyOptional()
    paticipationXP?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    subjectId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    quizId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    userId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    winnerUserId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    opponentUserId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    acceptanceStatus?: "ACCEPTED" | "REJECTED" | "PENDING" = "PENDING";
}
