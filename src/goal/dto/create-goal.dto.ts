import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({ example: 'WAEC', description: 'The title of the goal' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'This goal', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://example.com/avatar.png', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    example: 'b8d2e4d8-94a2-4d8a-8c90-9c7c12345678',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
