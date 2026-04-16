import { ApiProperty } from '@nestjs/swagger';

export class ClassResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Mathematics 101' })
  title: string;

  @ApiProperty({ example: 'Introduction to algebra', required: false })
  description?: string;

  @ApiProperty({ example: '2026-01-10T10:00:00Z' })
  startTime: Date;

  @ApiProperty({ example: '2026-01-10T12:00:00Z' })
  endTime: Date;

  @ApiProperty({ example: 'https://zoom.us/j/12345' })
  roomId: string;

  @ApiProperty({ example: 'uuid-of-tutor' })
  tutorId: string;

  @ApiProperty({ example: ['student-uuid-1', 'student-uuid-2'] })
  enrolledStudents: string[];

  @ApiProperty({ example: ['student-uuid-1'] })
  attendance: string[];

  @ApiProperty({ example: 'https://zoom.us/j/123456789', required: false })
  roomUrl?: string;

  @ApiProperty({ example: 'uuid-of-subject' })
  subjectId: string;

  @ApiProperty({ example: 'https://bunny.net/j/12345', required: false })
  videoURL?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
