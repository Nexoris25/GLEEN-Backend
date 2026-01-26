//write quiz questions dto
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
export class CreateQuizQuestionDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    quizId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    question: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    explanation?: string;

    @ApiProperty({ enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'THEORY'],
        example: 'MULTIPLE_CHOICE',
     })
    @IsNotEmpty()
    @IsString()
    type: string;

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

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    correctAnswer: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    file: string;
}