import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateXpConversionDto {
  @ApiProperty({
    description: 'XP use limit per time (% of daily earnings)',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  xpLimitPerTimePercentage: number;

  @ApiProperty({
    description: 'XP use limit per day (% of daily earnings)',
    example: 20,
  })
  @IsNumber()
  @Min(0)
  xpLimitPerDayPercentage: number;

  @ApiProperty({ description: 'XP value per N of airtime', example: 100 })
  @IsNumber()
  @Min(0)
  airtimeXpValuePerNaira: number;

  @ApiProperty({
    description: 'Scholar subscription plan (XP Required)',
    example: 5000,
  })
  @IsNumber()
  @Min(0)
  scholarSubscriptionXpRequired: number;

  @ApiProperty({
    description: 'Champion subscription plan (XP Required)',
    example: 10000,
  })
  @IsNumber()
  @Min(0)
  championSubscriptionXpRequired: number;
}
