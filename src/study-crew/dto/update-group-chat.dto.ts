import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGroupChatDto {
  @ApiPropertyOptional({ enum: ['READ', 'UNREAD'] })
  status?: string;

  @ApiPropertyOptional()
  message?: string;
}