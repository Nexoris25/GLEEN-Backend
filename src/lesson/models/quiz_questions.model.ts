//write quiz model
// with id, lessonId, question, options, correctAnswer, createdAt, updatedAt
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
import { StudentsQuizAnswers } from './students_quiz_answers';
import { Quizzes } from './quiz.model';

@Table({ tableName: 'quiz_questions', timestamps: true })
export class QuizQuestions extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => Quizzes)
  @Column({ type: DataType.UUID })
  quizId: string;

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

  // @ApiProperty()
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  // @ApiProperty()
  @BelongsTo(() => Quizzes, 'quizId')
  quiz: Quizzes;

  @ApiProperty({ type: () => User })
  @BelongsTo(() => User, 'userId')
  user: User;

  @HasMany(() => StudentsQuizAnswers, 'quizQuestionId')
  studentsQuizAnswers: StudentsQuizAnswers[];

  @BeforeCreate
  static async setUserId(
    instance: QuizQuestions,
    options: { [key: string]: any },
  ) {
    // Retrieve the authenticated user ID
    const authUserId = options.userId || instance.userId;
    if (!authUserId) {
      throw new Error('Authenticated user ID is not available');
    }
    instance.userId = authUserId;
  }
}
