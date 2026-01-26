//write quiz questions dto
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
export class CreateQuizDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    duration: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;


    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    instructions?: string;

    @ApiPropertyOptional({
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        example: 'PENDING',
    })
    @IsOptional()
    @IsString()
    status: string = 'PENDING';

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    subjectId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    avatar: string;
}