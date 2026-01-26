//write quiz questions dto
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
export class CreateMockQuestionDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    mockExamId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    question: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    explanation?: string;

    @ApiProperty({ enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'THEORY'] })
    @IsNotEmpty()
    @IsString()
    type: string;

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