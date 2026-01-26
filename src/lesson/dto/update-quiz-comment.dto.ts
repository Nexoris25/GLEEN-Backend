import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
export class UpdateQuizCommentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  quizId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rating: number;
}