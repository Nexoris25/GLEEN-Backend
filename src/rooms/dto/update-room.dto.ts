import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateRoomDto {
  @ApiPropertyOptional({
    description: 'New room name (A-Z, a-z, 0-9, -, _ only)',
    example: 'math_class_2026',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9-_]+$/, {
    message:
      'Room name can only contain letters, numbers, hyphens (-), and underscores (_)',
  })
  name?: string;
}
