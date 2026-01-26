import { IsString, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinRoomDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

export class LeaveRoomDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

export class SendMessageDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class MarkAsReadDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  messageId: string;
}
