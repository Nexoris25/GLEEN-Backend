//write students_mock_answers model
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
import { MockQuestions } from './mock-questions.model';
import { MockExamRecord } from './mock-exam-record.model';

@Table({ tableName: 'students_mock_answers', timestamps: true })
export class StudentsMockAnswers extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @ForeignKey(() => MockQuestions)
  @Unique('exam_record_question_unique')
  @Column({ type: DataType.UUID })
  mockQuestionId: string;

  @ApiProperty()
  @ForeignKey(() => MockExamRecord)
  @Unique('exam_record_question_unique')
  @Column({ type: DataType.UUID })
  mockExamRecordId: string;

  @ApiProperty()
  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  score: number;

  @ApiProperty()
  @ForeignKey(() => User)
  @Unique('exam_record_question_unique')
  @Column({ type: DataType.UUID })
  userId: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  answer: string;

  @ApiProperty()
  @BelongsTo(() => MockQuestions, 'mockQuestionId')
  mockQuestion: MockQuestions;

  @ApiProperty({ type: () => User })
  @BelongsTo(() => User, 'userId')
  user: User;

  @BeforeCreate
  static async setUserId(
    instance: StudentsMockAnswers,
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
