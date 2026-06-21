import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class DashboardQueryDto {
  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: 'Start date for the dashboard range',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2025-12-31T23:59:59.999Z',
    description: 'End date for the dashboard range',
  })
  @IsDateString()
  endDate: string;
}
