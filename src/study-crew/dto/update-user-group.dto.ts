import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserGroupDto {
  @ApiPropertyOptional({ enum: ['ACCEPTED', 'DECLINED', 'PENDING'] })
  status?: string;
}