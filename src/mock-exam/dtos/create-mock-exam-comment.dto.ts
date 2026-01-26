import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
export class CreateMockExamCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  mockExamId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rating: number;
}