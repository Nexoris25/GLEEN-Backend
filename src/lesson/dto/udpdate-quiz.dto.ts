//write quiz questions dto
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
export class UpdateQuizDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    duration: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        example: 'PENDING',
    })
    @IsOptional()
    @IsString()
    status: string = 'PENDING';

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    instuctions?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    subjectId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    avatar: string;
}