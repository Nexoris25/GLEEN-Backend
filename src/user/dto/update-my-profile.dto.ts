import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { IsLgaExists } from 'src/common/validators/is-lga-exists.validator';
import { IsStateExists } from 'src/common/validators/IsStateExists';

export class UpdateMyProfileDto {
  @ApiPropertyOptional({ description: 'Profile picture URL' })
  @IsString()
  @IsOptional()
  picUrl?: string;

  @ApiPropertyOptional({ description: 'Full name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Gender', example: 'MALE' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'State ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  @IsStateExists()
  state?: string;

  @ApiPropertyOptional({
    description: 'Local government area ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  @IsLgaExists()
  localGovernment?: string;
}
