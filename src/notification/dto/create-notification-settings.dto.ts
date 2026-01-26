import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationSettingsDto {
  @ApiProperty({ type: Boolean })
  userNotification: boolean;

  @ApiProperty({ type: Boolean })
  emailNotification: boolean;

  @ApiProperty({ type: Boolean })
  appNotification: boolean;

  @ApiProperty({ type: Boolean })
  pushNotification: boolean;

  @ApiProperty({ type: Boolean })
  soundNotification: boolean;

  @ApiProperty({ type: String, format: 'uuid' })
  userId: string;
}