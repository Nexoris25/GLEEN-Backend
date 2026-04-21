import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BeforeCreate,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Subject } from 'src/subject/models/subject.model';
import { StudentsQuizAnswers } from './students_quiz_answers';
import { QuizQuestions } from './quiz_questions.model';

@Table({
  tableName: 'quizzes',
  timestamps: true,
})
export class Quizzes extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @Unique
  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @ApiProperty({
    description: 'Duration in seconds',
    example: 120,
    minimum: 0,
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false, // ← makes it required in database
    defaultValue: 0, // optional but often useful
  })
  duration: number;

  @ApiProperty({ type: [String] })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @ApiProperty()
  @Default('PENDING')
  @Column({
    type: DataType.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    allowNull: false,
  })
  status: string;

  @ApiProperty()
  @Column({
    type: DataType.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('instructions') as unknown;
      if (raw === null || raw === undefined) return [];
      if (Array.isArray(raw)) return raw;
      const str = String(raw).trim();
      if (!str) return [];
      try {
        const parsed = JSON.parse(str) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.map((v) => String(v));
        }
      } catch {}
      return str
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    },
    set(value: unknown) {
      if (value === null || value === undefined) {
        this.setDataValue('instructions', null);
        return;
      }
      if (Array.isArray(value)) {
        this.setDataValue('instructions', JSON.stringify(value));
        return;
      }
      this.setDataValue('instructions', String(value));
    },
  })
  instructions?: string[];

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  avatar: string;

  @ApiProperty()
  @ForeignKey(() => Subject)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  subjectId: string;

  // @ApiProperty()
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  userId?: string;

  @ApiProperty()
  @HasMany(() => QuizQuestions, { foreignKey: 'quizId' })
  quizQuestions: QuizQuestions[];

  @ApiPropertyOptional({ description: 'Number of questions in the quiz' })
  @Column(DataType.VIRTUAL)
  questionCount?: number;

  @ApiProperty()
  @BelongsToMany(
    () => StudentsQuizAnswers,
    () => QuizQuestions,
    'quizId',
    'quizQuestionId',
  )
  studentsQuizAnswers: StudentsQuizAnswers[];

  @BeforeCreate
  static setUserId(instance: Quizzes, options: { [key: string]: any }) {
    // Retrieve the authenticated user ID
    const authUserId = options.userId;
    if (!authUserId) {
      throw new Error('Authenticated user ID is not available');
    }
    instance.userId = authUserId;
  }
}
