import { ApiProperty } from '@nestjs/swagger';

export class StudentGrowthPointDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  bucketStart: string;

  @ApiProperty()
  bucketEnd: string;

  @ApiProperty()
  count: number;
}

export class StudentGrowthResponseDto {
  @ApiProperty({ enum: ['daily', 'weekly', 'monthly'] })
  granularity: 'daily' | 'weekly' | 'monthly';

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;

  @ApiProperty({ type: [StudentGrowthPointDto] })
  points: StudentGrowthPointDto[];
}

