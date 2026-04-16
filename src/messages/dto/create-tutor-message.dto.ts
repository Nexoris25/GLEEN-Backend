// src/messages/dto/create-tutor-message.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ArrayNotEmpty,
  ValidateIf,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// ----------------------------
// Custom Validator: Ensure at least one recipient field exists
// ----------------------------
@ValidatorConstraint({ name: 'HasRecipient', async: false })
export class HasRecipientConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as CreateTutorMessageDto;
    return !!(
      obj.sendToAll ||
      obj.studentId ||
      obj.stateId ||
      obj.subjectId ||
      (obj.classIds && obj.classIds.length > 0)
    );
  }

  defaultMessage(args: ValidationArguments) {
    return 'You must provide at least one recipient: studentId, sendToAll, stateId, subjectId, or classIds';
  }
}

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
  @IsOptional()
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

  // ----------------------------
  // Apply custom validator
  // ----------------------------
  @Validate(HasRecipientConstraint)
  dummyField?: any;
}
