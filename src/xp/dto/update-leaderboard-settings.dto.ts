import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateLeaderboardSettingsDto {
  @ApiProperty({ description: 'Show real names on the leaderboard', example: false })
  @IsBoolean()
  showRealNames: boolean;

  @ApiProperty({ description: 'Anonymize users outside top 10 on the boards', example: true })
  @IsBoolean()
  anonymizeOutsideTop10: boolean;

  @ApiProperty({ description: 'Allow users to opt-out of leaderboards', example: true })
  @IsBoolean()
  allowOptOut: boolean;

  @ApiProperty({ description: 'Show rank movement per day', example: true })
  @IsBoolean()
  showRankMovement: boolean;
}
