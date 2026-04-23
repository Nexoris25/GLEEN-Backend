import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { UserStatusEnum } from 'src/shared-types/UserStatusEnum';
import { IsStateExists } from 'src/common/validators/IsStateExists';
import { IsLgaExists } from 'src/common/validators/is-lga-exists.validator';
import { Transform } from 'class-transformer';
import { RoleEnum } from '../../shared-types/RoleEnum';

export class UpdateUserDto {
  @ApiPropertyOptional({ required: false })
  @IsString()
  @IsOptional()
  referral?: string;

  @ApiPropertyOptional({ required: false })
  @IsString()
  @IsOptional()
  guardianEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(RoleEnum, { message: 'Invalid role' })
  role?: RoleEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  systemAvatar?: string;

  @ApiPropertyOptional({ required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    required: false,
    description: 'Gender',
    example: 'MALE',
  })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    required: false,
    description: 'State ID (must exist)',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  @IsStateExists()
  stateId?: string;

  @ApiPropertyOptional({
    required: false,
    description: 'LGA ID (must exist)',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  @IsLgaExists()
  lga?: string;

  @ApiPropertyOptional({
    required: false,
    type: 'string',
    description: 'Avatar URL',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    required: false,
    enum: UserStatusEnum,
    example: UserStatusEnum.ACTIVE,
  })
  @IsEnum(UserStatusEnum)
  @IsOptional()
  status?: UserStatusEnum;
}
