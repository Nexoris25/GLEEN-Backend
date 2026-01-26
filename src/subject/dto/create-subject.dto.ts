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
type: 'string',
format: 'binary', // ⚡ tells Swagger this is a file
description: 'Avatar image file (optional)',
})
@IsOptional()
avatar?: any; // ⚡ must be any for multer file

 @ApiPropertyOptional()
  @IsOptional()
  tutorId?: string;
}
