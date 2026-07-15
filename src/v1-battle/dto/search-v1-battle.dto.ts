import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SearchV1BattleDto {
  @ApiPropertyOptional()
  @IsOptional()
  duration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  subjectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  quizId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  winnerUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  opponentUserId?: string;

  @ApiPropertyOptional({ enum: ['ACCEPTED', 'REJECTED', 'PENDING'] })
  @IsOptional()
  acceptanceStatus?: 'ACCEPTED' | 'REJECTED' | 'PENDING';

  @ApiPropertyOptional()
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;
}
