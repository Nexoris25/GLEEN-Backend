import { ApiProperty } from '@nestjs/swagger';

export class CreateUserGroupDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  groupId: string;

  @ApiProperty({
    enum: ['ACCEPTED', 'DECLINED', 'PENDING'],
    default: 'PENDING',
  })
  status?: string;
}
