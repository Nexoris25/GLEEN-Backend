import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { ComplaintComment } from '../models/complaint-comment.model';
import { PResponseDto, ResponseDto } from 'src/shared-types/response.dto';

export class CreateComplaintCommentDto {
  @ApiProperty({
    example: 'b1a6b5e7-56e1-4dc5-a34a-123456789abc',
    description: 'Complaint ID this comment belongs to',
  })
  @IsUUID()
  complaintId: string;

  @ApiProperty({
    example: 'I have faced the same issue',
    description: 'Comment text',
  })
  @IsString()
  comment: string;
}

export class UpdateComplaintCommentDto extends PartialType(
  CreateComplaintCommentDto,
) {}

export class ComplaintCommentResponseDto extends ResponseDto<ComplaintComment> {
  @ApiProperty({ type: () => ComplaintComment })
  data?: ComplaintComment;
}

export class ComplaintCommentArrayResponseDto extends ResponseDto<ComplaintComment> {
  @ApiProperty({ type: () => ComplaintComment, isArray: true })
  data?: ComplaintComment[];
}

export class ComplaintCommentArrayResponseCountDto extends ResponseDto<
  PResponseDto<ComplaintComment>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<ComplaintComment> })
  data?: PResponseDto<ComplaintComment>;
}
