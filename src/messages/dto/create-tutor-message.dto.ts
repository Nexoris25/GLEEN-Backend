// src/messages/dto/create-tutor-message.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateTutorMessageDto {
  @ApiProperty({
    example: 'Upcoming Mathematics Class',
    description: 'Message title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Don’t forget to revise chapter 3 before tomorrow’s class.',
    description: 'Message body',
  })
  @IsString()
  message: string;

  @ApiProperty({
    example: false,
    default: false,
    description: 'If true, message is sent to all students',
  })
  @IsBoolean()
  sendToAll: boolean;

  /* -------------------- STATE -------------------- */
@ApiPropertyOptional({
    example: 'a3b1c7d2-9b0f-4e92-8a2c-0f4a2b8c7d11',
    format: 'uuid',
    description: 'State ID (references state.id)',
  })
  @IsOptional()
  @IsUUID()
  stateId?: string;

  /* -------------------- SUBJECT -------------------- */
  @ApiPropertyOptional({
    example: 'a3b1c7d2-9b0f-4e92-8a2c-0f4a2b8c7d11',
    format: 'uuid',
    description: 'Subject ID (references subjects.id)',
  })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  /* -------------------- STUDENT -------------------- */
  @ApiPropertyOptional({
    example: 'f2e7c9a1-1a45-4f9d-8b30-92c9f84f0e99',
    format: 'uuid',
    description: 'Student ID (references users.id)',
  })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  /* -------------------- CLASSES -------------------- */
  @ApiPropertyOptional({
    example: [
      'c91f5c84-3e90-4a5c-8a3a-8c1b7a44b7aa',
      'a12b9e3f-74b1-4f8a-b49d-6c32d1a7f992',
    ],
    type: [String],
    description: 'Class IDs (references classes.id)',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  classIds?: string[];
}
