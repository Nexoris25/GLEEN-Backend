import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Avatar image URL (already uploaded to Bunny or elsewhere)',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  tutorId?: string;
}
