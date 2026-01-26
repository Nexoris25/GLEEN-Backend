import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchGroupDto {
  @ApiPropertyOptional({ description: 'Search term for name' })
  name?: string;

  @ApiPropertyOptional({ description: 'Search term for description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Search by user ID' })
  userId?: string;

  @ApiPropertyOptional({ description: 'Partial match search across fields' })
  keyword?: string;
}
