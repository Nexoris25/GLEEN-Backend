import { IsStateExists } from 'src/common/validators/IsStateExists'; 
import { IsLgaExists } from 'src/common/validators/is-lga-exists.validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { RoleEnum } from 'src/shared-types/RoleEnum';
import { Transform } from 'class-transformer';


export class CreateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  referral?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  guardianEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country: string;

    @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  systemAvatar?: string;

  /*
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cityId: string;
*/
 @ApiPropertyOptional({
  example: 'P@ssw0rd',
  description: 'Password of the user',
  minLength: 6,
})
@IsOptional()
@IsString()
@MinLength(6)
@Transform(({ value }) =>
  value === null || value === '' ? undefined : value,
)
password?: string;


  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email of the user',
  })
  @IsEmail()
  email: string;


  /*
@ApiPropertyOptional()
@IsOptional()
@IsBoolean()
@Transform(({ value }) => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
})
isEmailVerified?: boolean;
*/
  
  @ApiPropertyOptional({
    example: RoleEnum.USER,
    enum: RoleEnum,
    description: 'Role of the user',
  })
  @IsOptional()
  @IsString()
  role?: RoleEnum = RoleEnum.USER;

   @ApiPropertyOptional({
    type: 'string',
    format: 'binary', // ⚡ tells Swagger this is a file
    description: 'Avatar image file (optional)',
  })
  @IsOptional()
  avatar?: any; // ⚡ must be any for multer file


  
  @ApiPropertyOptional({
    description: 'State ID (optional, must exist in states if provided)',
    example: 'b1a8f4aa-8f91-4c41-8b07-9cb23d61caaa',
  })
  @IsUUID()
  @IsOptional()
  @IsStateExists({ message: 'The provided stateId does not exist in the states table' })
  stateId?: string;

 @ApiPropertyOptional({
    description: 'LGA ID (optional, must exist in lga if provided)',
    example: 'c2d1f93e-3a61-4e6f-8d6b-89b4f18a1d77',
  })
  @IsUUID()
  @IsOptional()
  @IsLgaExists({ message: 'The provided LGA does not exist' })
  lga?: string;
  
}
