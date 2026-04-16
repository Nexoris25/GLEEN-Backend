//write students_quiz_answers model
import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeCreate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { IsUUID, PrimaryKey, Default } from 'sequelize-typescript';
import { User } from 'src/user/models/user.model';
import { QuizQuestions } from 'src/lesson/models/quiz_questions.model';
import { V1Battle } from './v1-battle.model';
import { V1BattleRecord } from './v1-battle-record.model';

@Table({ tableName: 'v_one_battle_question_answers', timestamps: true })
export class V1BattleQuestionAnswers extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @ForeignKey(() => QuizQuestions)
  @Unique('v_one_record_question_unique')
  @Column({ type: DataType.UUID })
  quizQuestionId: string;

  @ApiProperty()
  @ForeignKey(() => V1Battle)
  @Unique('v_one_record_question_unique')
  @Column({ type: DataType.UUID })
  vOneBattleId: string;

  @ApiProperty()
  @ForeignKey(() => V1BattleRecord)
  @Unique('v_one_record_question_unique')
  @Column({ type: DataType.UUID })
  vOneBattleRecordId: string;

  @ApiProperty()
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  userId: string;

  @ApiProperty()
  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  score: number;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  answer: string;

  @ApiProperty()
  @BelongsTo(() => QuizQuestions, 'quizQuestionId')
  quizQuestion: QuizQuestions;

  @ApiProperty()
  @BelongsTo(() => User, 'userId')
  user: User;

  @ApiProperty()
  @BelongsTo(() => V1Battle, 'vOneBattleId')
  vOneBattle: V1Battle;

  @BeforeCreate
  static async setUserId(
    instance: V1BattleQuestionAnswers,
    options: { [key: string]: any },
  ) {
    // Retrieve the authenticated user ID
    const authUserId = options.userId;
    if (!authUserId) {
      throw new Error('Authenticated user ID is not available');
    }
    instance.userId = authUserId;
  }
}
