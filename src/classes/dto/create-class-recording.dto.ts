
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, IsUUID, IsOptional } from 'class-validator';

export class CreateClassRecordingDto {
  @ApiProperty({ example: 'https://example.com/recording.mp4', description: 'Full URL of the recording' })
  @IsUrl({}, { message: 'videoUrl must be a valid URL' })
  @IsNotEmpty()
  videoUrl: string;

  @ApiProperty({ example: 'uuid-of-subject', description: 'ID of the subject' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: 'Mathematics Week 1 Recording', description: 'Title of the recording' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'This video covers algebraic expressions', description: 'Description of the recording' })
  @IsString()
  @IsOptional()
  description?: string;
}
