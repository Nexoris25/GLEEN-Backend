import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PResponseDto, ResponseDto } from 'src/shared-types/response.dto';
import { Complaint } from '../models/complaint.model';

export class CreateComplaintDto {
  @ApiProperty({ example: 'Payment not received', description: 'Complaint title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'I made a payment but it was not confirmed', description: 'Detailed description of the complaint' })
  @IsString()
  description: string;
}

export class UpdateComplaintDto extends PartialType(CreateComplaintDto) {
  @ApiProperty({ enum: ['open', 'in_progress', 'resolved'], required: false, example: 'resolved' })
  @IsOptional()
  @IsEnum(['open', 'in_progress', 'resolved'])
  status?: string;

  @ApiProperty({ required: false, example: new Date().toISOString() })
  @IsOptional()
  resolvedAt?: Date;
}

export class ComplaintResponseDto extends ResponseDto<Complaint> {
  @ApiProperty({ type: () => Complaint })
  data?: Complaint;
}

export class ComplaintArrayResponseDto extends ResponseDto<Complaint> {
  @ApiProperty({ type: () => Complaint, isArray: true })
  data?: Complaint[];
}

export class ComplaintArrayResponseCountDto extends ResponseDto<PResponseDto<Complaint>> {
  @ApiPropertyOptional({ type: () => PResponseDto<Complaint> })
  data?: PResponseDto<Complaint>;
}