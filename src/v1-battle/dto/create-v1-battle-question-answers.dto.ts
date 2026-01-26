import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNumber } from 'class-validator';

export class CreateV1BattleQuestionAnswersDto {
  @ApiProperty()
  @IsUUID()
  quizQuestionId: string;

  @ApiProperty()
  @IsUUID()
  vOneBattleId: string;

  @ApiProperty()
  @IsUUID()
  vOneBattleRecordId: string;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsString()
  answer: string;
}
