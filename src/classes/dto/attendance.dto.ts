import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AttendanceDto {
  @ApiProperty({ example: 'uuid-of-class' })
  @IsUUID()
  classId: string;
}
