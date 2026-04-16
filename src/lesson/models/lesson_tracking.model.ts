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
import { Lesson } from './lesson.model';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: 'lesson_trackings',
  timestamps: true,
  indexes: [
    {
      name: 'uniq_lesson_user',
      unique: true,
      fields: ['lessonId', 'userId'],
    },
  ],
})
export class LessonTracking extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @ForeignKey(() => Lesson)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  lessonId: string;

  @ApiProperty({
    description: 'When this lesson is completed',
    nullable: true,
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null,
  })
  dateCompleted: Date | null;

  @ApiProperty()
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => Lesson)
  lesson: Lesson;

  @BelongsTo(() => User)
  user: User;

  @BeforeCreate
  static setUserId(instance: LessonTracking, options: { userId?: string }) {
    if (options?.userId) {
      instance.userId = options.userId;
    }
  }
}
