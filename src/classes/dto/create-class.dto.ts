// src/classes/dto/create-class.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsDate,
} from 'class-validator';
import { IsBefore } from 'src/common/validators/is-before.validator';
import { Type } from 'class-transformer';

export class CreateClassDto {
  @ApiProperty({ example: 'Mathematics 101' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Introduction to algebra' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '2026-01-10T10:00:00Z',
    description: 'Class start time (ISO 8601)',
  })
  @IsNotEmpty()
  @Type(() => Date) // ⬅️ transforms string → Date
  @IsDate({ message: 'startTime must be a valid date' })
  @IsBefore('endTime', {
    message: 'startTime must be earlier than endTime',
  })
  startTime: Date;

  @ApiProperty({
    example: '2026-01-10T12:00:00Z',
    description: 'Class end time (ISO 8601)',
  })
  @IsNotEmpty()
  @Type(() => Date) // ⬅️ transforms string → Date
  @IsDate({ message: 'endTime must be a valid date' })
  endTime: Date;

  @ApiProperty({ example: 'uuid-of-tutor' })
  @IsUUID()
  @IsOptional()
  tutorId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-subject' })
  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @ApiPropertyOptional({ example: 'Room 101' })
  @IsString()
  @IsOptional()
  roomName?: string;

  @ApiPropertyOptional({ example: '2026-01-10' })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: '10:00 AM' })
  @IsString()
  @IsOptional()
  time?: string;
}
