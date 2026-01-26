import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class EnrollDto {
  @ApiProperty({ example: 'uuid-of-class' })
  @IsUUID()
  classId: string;
}
