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
import { QuizQuestions } from './quiz_questions.model';
import { v4 as uuidv4 } from 'uuid';
import { IsUUID, PrimaryKey, Default } from 'sequelize-typescript';
import { User } from 'src/user/models/user.model';
import { QuizRecord } from './quiz-record.model';

@Table({ tableName: 'students_quiz_answers', timestamps: true })
export class StudentsQuizAnswers extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @ForeignKey(() => QuizQuestions)
  @Unique('quiz_record_question_unique')
  @Column({ type: DataType.UUID })
  quizQuestionId: string;

  @ApiProperty()
  @ForeignKey(() => QuizRecord)
  @Unique('quiz_record_question_unique')
  @Column({ type: DataType.UUID })
  quizRecordId: string;

  // @ApiProperty()
  @ForeignKey(() => User)
  @Unique('quiz_record_question_unique')
  @Column({ type: DataType.UUID })
  userId: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  answer: string;

  @ApiProperty()
  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  score: number;

  @ApiProperty()
  @BelongsTo(() => QuizQuestions, 'quizQuestionId')
  quizQuestion: QuizQuestions;

  @ApiProperty({ type: () => User })
  @BelongsTo(() => User, 'userId')
  user: User;

  @BeforeCreate
  static async setUserId(
    instance: StudentsQuizAnswers,
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
