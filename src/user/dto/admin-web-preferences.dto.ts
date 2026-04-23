import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class AdminWebPreferencesDto {
  @ApiProperty()
  @IsString()
  theme_mode: string;

  @ApiProperty()
  @IsString()
  font_size: string;

  @ApiProperty()
  @IsBoolean()
  remember_me: boolean;
}
