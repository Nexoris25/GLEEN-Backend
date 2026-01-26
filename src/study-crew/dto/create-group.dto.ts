import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateGroupDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;


    @ApiPropertyOptional({
      type: 'string',
      format: 'binary', // ⚡ tells Swagger this is a file
      description: 'Avatar image file (optional)',
    })
    @IsOptional()
    avatar?: any; // ⚡ must be any for multer file

  @ApiPropertyOptional({ default: true })
   @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  openToPublic?: boolean;

  @ApiPropertyOptional({ default: false })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  restrictMessaging?: boolean;

  @ApiPropertyOptional({ default: false })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  onlyOwnerAddMembers?: boolean;
}