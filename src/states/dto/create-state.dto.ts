import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStateDto {
  @ApiProperty({
    example: 'Federal Capital Territory',
    description: 'The title of the state',
  })
  @IsNotEmpty()
  @IsString()
  title: string;
}
