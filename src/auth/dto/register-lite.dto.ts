import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { RoleEnum } from 'src/shared-types/RoleEnum';

export class RegisterLiteDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: 'Password of the user',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: 'Confirm password',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  confirmPassword: string;

  @ApiPropertyOptional({
    example: 'referralUsername',
    description: 'Referral code/username (optional)',
  })
  @IsString()
  @IsOptional()
  referral?: string;

  @ApiProperty({
    example: RoleEnum.USER,
    enum: [RoleEnum.USER, RoleEnum.TUTOR],
    description: 'Role of the user',
  })
  @IsIn([RoleEnum.USER, RoleEnum.TUTOR], { message: 'Invalid role' })
  role: RoleEnum;
}
