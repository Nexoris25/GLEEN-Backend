import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeCreate,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/user/models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { Lesson } from './lesson.model';
import { Quizzes } from './quiz.model';

@Table({
  tableName: 'quiz_comments',
  timestamps: true,
})
export class QuizComment extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @ForeignKey(() => Quizzes)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  quizId: string;

  // @ApiProperty()
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @ApiProperty()
  @Column({
    type: DataType.DECIMAL(3, 2),
    allowNull: true,
  })
  rating: number;

  @ApiProperty()
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  content: string;

  @ApiProperty()
  @BelongsTo(() => Quizzes)
  quiz: Quizzes;

  @ApiProperty({ type: () => User })
  @BelongsTo(() => User)
  user: User;

  @BeforeCreate
  static async setUserId(instance: Lesson, options: { [key: string]: any }) {
    // Retrieve the authenticated user ID
    const authUserId = options.userId;
    if (!authUserId) {
      throw new Error('Authenticated user ID is not available');
    }
    instance.userId = authUserId;
  }
}
