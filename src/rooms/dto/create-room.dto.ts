// rooms/dto/create-room.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Room name (letters, numbers, - and _ only)',
    example: 'my_room-123',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-z0-9-_]+$/, {
    message:
      'Room name can only contain letters, numbers, hyphens (-), and underscores (_)',
  })
  name: string;
}
