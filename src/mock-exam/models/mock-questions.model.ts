//write mock model
// with id, mockExamId, question, options, correctAnswer, createdAt, updatedAt
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BeforeCreate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { IsUUID, PrimaryKey, Default } from 'sequelize-typescript';
import { User } from 'src/user/models/user.model';
import { MockExams } from './mock-exam.model';
import { StudentsMockAnswers } from './students-mock-answers.model';

@Table({ tableName: 'mock_questions', timestamps: true })
export class MockQuestions extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => MockExams)
  @Column({ type: DataType.UUID })
  mockExamId: string;

  @ApiProperty()
  @Column({ type: DataType.TEXT, allowNull: false })
  question: string;

  @ApiProperty()
  @Column({ type: DataType.TEXT, allowNull: false })
  explanation: string;

  @ApiProperty()
  @Column({
    type: DataType.ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'THEORY'),
    allowNull: false,
  })
  type: string;

  @ApiProperty()
  @Default('PENDING')
  @Column({
    type: DataType.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    allowNull: false,
  })
  status: string;

  @ApiPropertyOptional()
  @Column({ type: DataType.JSONB, allowNull: true })
  options: any[];

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  correctAnswer: string;

  @ApiPropertyOptional()
  @Column({ type: DataType.STRING, allowNull: true })
  file: string;

  @ApiProperty()
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @ApiProperty()
  @BelongsTo(() => MockExams, 'mockExamId')
  mockExam: MockExams;

  @ApiProperty({ type: () => User })
  @BelongsTo(() => User, 'userId')
  user: User;

  @HasMany(() => StudentsMockAnswers, 'mockQuestionId')
  studentsMockAnswers: StudentsMockAnswers[];

  @BeforeCreate
  static async setUserId(
    instance: MockQuestions,
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
