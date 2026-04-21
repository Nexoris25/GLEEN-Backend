import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class LinkSubjectsGoalsDto {
  @ApiPropertyOptional({
    description: 'Array of subject IDs (uuid)',
    type: [String],
    example: ['b1a8f4aa-8f91-4c41-8b07-9cb23d61caaa'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  subjects?: string[];

  @ApiPropertyOptional({
    description: 'Array of goal IDs (uuid)',
    type: [String],
    example: ['c2d1f93e-3a61-4e6f-8d6b-89b4f18a1d77'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  goals?: string[];
}
