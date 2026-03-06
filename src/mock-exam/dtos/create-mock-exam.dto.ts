//write quiz questions dto
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
export class CreateMockExamDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  duration: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  mockTypeId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  subjectId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar: string;
}
