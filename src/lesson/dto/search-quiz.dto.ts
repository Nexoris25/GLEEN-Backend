//write quiz questions dto
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
export class SearchQuizDto {
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
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  subjectId: string;

  @ApiPropertyOptional({
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    example: 'PENDING',
  })
  @IsOptional()
  @IsString()
  status: string = 'PENDING';

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId: string;

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