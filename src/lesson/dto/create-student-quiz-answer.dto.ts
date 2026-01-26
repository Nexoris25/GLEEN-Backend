//write students_quiz_answers dto
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateStudentQuizAnswerDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    quizQuestionId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    quizRecordId: string;

    @ApiProperty()
    @IsNotEmpty()
    answer: string;
    
}
