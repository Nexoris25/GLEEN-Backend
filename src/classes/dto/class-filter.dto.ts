import { IsOptional, IsNumber, IsString } from 'class-validator';

export class ClassFilterDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  status?: 'upcoming' | 'live' | 'ended';

  @IsOptional()
  @IsString()
  teacherId?: string;
}
