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

  @ApiProperty({ type: Boolean, description: 'Alerts for new peer messages' })
  newMessages: boolean;

  @ApiProperty({ type: Boolean, description: 'Crew activity updates' })
  crewUpdates: boolean;

  @ApiProperty({ type: Boolean, description: 'App feature/update news' })
  appUpdates: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Weekly parent email/SMS reporting',
  })
  parentsReporting: boolean;

  @ApiProperty({ type: String, format: 'uuid' })
  userId: string;
}
