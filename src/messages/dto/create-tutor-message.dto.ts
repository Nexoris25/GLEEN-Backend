// src/messages/dto/create-tutor-message.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// ----------------------------
// Custom Validator: ensure at least one recipient target is provided.
// ----------------------------
@ValidatorConstraint({ name: 'HasRecipient', async: false })
export class HasRecipientConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments) {
    const obj = args.object as CreateTutorMessageDto;
    return !!(
      obj.sendToAll ||
      obj.stateIds?.length ||
      obj.subjectIds?.length ||
      obj.classIds?.length ||
      obj.studentIds?.length
    );
  }

  defaultMessage() {
    return 'You must provide at least one recipient: sendToAll, stateIds, subjectIds, classIds, or studentIds';
  }
}

export class CreateTutorMessageDto {
  @ApiProperty({
    example: 'Upcoming Mathematics Class',
    description: 'Message subject/title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Don’t forget to revise chapter 3 before tomorrow’s class.',
    description: 'Message body',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    example: false,
    default: false,
    description: 'If true, message is sent to all students (ignores filters)',
  })
  @IsOptional()
  @IsBoolean()
  sendToAll?: boolean;

  /* -------------------- STATES -------------------- */
  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    description: 'Send to every student in these states (references state.id)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  stateIds?: string[];

  /* -------------------- SUBJECTS -------------------- */
  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    description: 'Send to every student taking these subjects (subjects.id)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  subjectIds?: string[];

  /* -------------------- CLASSES -------------------- */
  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    description: 'Send to every student enrolled in these classes (classes.id)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  classIds?: string[];

  /* -------------------- INDIVIDUAL STUDENTS -------------------- */
  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    description: 'Send to these specific students (users.id)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds?: string[];

  // ----------------------------
  // Apply custom validator (must appear after the target fields).
  // ----------------------------
  @Validate(HasRecipientConstraint)
  dummyField?: unknown;
}
