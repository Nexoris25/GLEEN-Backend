import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  /*
@ApiProperty()
@IsUUID()
@IsNotEmpty()
userId: string;

@ApiPropertyOptional({
enum: ['PENDING', 'APPROVED', 'REJECTED'],
example: 'PENDING',
})
@IsOptional()
@IsString()
status: string = 'PENDING';

@ApiPropertyOptional()
@IsString()
@IsOptional()
publishedAt?: Date;
*/

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Avatar image URL (optional)',
  })
  @IsOptional()
  @IsString()
  avatarOrCover?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mainContent?: string;
}
