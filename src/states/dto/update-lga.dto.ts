import { PartialType } from '@nestjs/swagger';
import { CreateLgaDto } from './create-lga.dto';
import { IsOptional } from 'class-validator';

export class UpdateLgaDto extends PartialType(CreateLgaDto) {
  @IsOptional()
  title?: string;

  @IsOptional()
  stateId?: string;
}
