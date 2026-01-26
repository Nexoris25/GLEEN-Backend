import { ApiProperty } from '@nestjs/swagger';

export class MetricsResponseDto {
  @ApiProperty({ example: 120, description: 'Total number of users' })
  totalUsers: number;

  @ApiProperty({ example: 45, description: 'Total number of active classes' })
  totalClasses: number;

  @ApiProperty({ example: 350, description: 'Total enrollments across all classes' })
  totalEnrollments: number;

  @ApiProperty({ example: 80, description: 'Total rooms created' })
  totalRooms: number;

  @ApiProperty({ example: 15, description: 'Total quizzes completed' })
  totalQuizzesCompleted: number;

  @ApiProperty({ example: 100, description: 'Total attendance recorded' })
  totalAttendance: number;

  // Add more metrics as needed
}
