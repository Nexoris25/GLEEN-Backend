import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateV1BattleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  questionCount?: number;

  @ApiProperty()
  @IsNumber()
  winnerXP: number;

  @ApiProperty()
  @IsNumber()
  participationXP: number;

  @ApiProperty()
  @IsUUID()
  subjectId: string;

  @ApiProperty()
  @IsUUID()
  quizId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty()
  @IsUUID()
  opponentUserId: string;
}
