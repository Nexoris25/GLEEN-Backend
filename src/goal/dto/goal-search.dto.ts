import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchGoalDto {
  @ApiPropertyOptional({ description: 'Search term for title' })
  title?: string;

  @ApiPropertyOptional({ description: 'Search term for description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Search by user ID' })
  userId?: string;

  @ApiPropertyOptional({ description: 'Partial match search across fields' })
  keyword?: string;
}
