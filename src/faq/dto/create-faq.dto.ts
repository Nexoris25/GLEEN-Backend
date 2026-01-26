import { ApiProperty } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty({ description: 'FAQ question', type: String })
  question: string;

  @ApiProperty({ description: 'FAQ answer', type: String })
  answer: string;
}