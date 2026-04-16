//write students_quiz_answers dto
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateStudentMockAnswerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  mockQuestionId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  mockExamRecordId: string;

  @ApiProperty()
  @IsNotEmpty()
  answer: string;
}
