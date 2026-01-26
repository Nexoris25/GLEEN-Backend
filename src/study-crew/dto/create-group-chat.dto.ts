import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupChatDto {
  @ApiProperty()
  groupId: string;

  @ApiProperty()
  message: string;
}