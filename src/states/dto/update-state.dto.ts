import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStateDto {
  @ApiPropertyOptional({ example: 'Abuja', required: false })
  @IsOptional()
  @IsString()
  title?: string;
}
