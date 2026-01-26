//write update-quiz-question.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
export class UpdateQuizQuestionDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    quizId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    question: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    explanation?: string;

    @ApiPropertyOptional({ enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'THEORY'],
        example: 'MULTIPLE_CHOICE',
     })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiPropertyOptional({
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        example: 'PENDING',
    })
    @IsOptional()
    @IsString()
    status: string = 'PENDING';

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject({ each: true })
    options?: any[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    correctAnswer: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    file: string;
}
