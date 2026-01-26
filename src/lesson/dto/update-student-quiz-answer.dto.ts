//write update-student-quiz-answer.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateStudentQuizAnswerDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    userId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    quizQuestionId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    answer: string;
}
