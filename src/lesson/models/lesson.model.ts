import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import {
  BeforeCreate,
  BelongsTo,
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
} from 'sequelize-typescript';
import { User } from 'src/user/models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { LessonComment } from './lesson_comment.model';
import { LessonTracking } from './lesson_tracking.model';
import { Subject } from 'src/subject/models/subject.model';
import { LessonTopic } from './lesson_topic.model';


@Table({
  tableName: 'lessons',
  timestamps: true,
})
export class Lesson extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @ForeignKey(() => Subject)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  subjectId: string;


  @ApiHideProperty()
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true, 
  })
  title: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  subtitle: string;

  @ApiProperty()
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @ApiProperty()
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  mainContent: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  avatarOrCover: string;

  @ApiProperty()
  @Default("PENDING")
  @Column({
    type: DataType.ENUM('PENDING', 'APPROVED', 'REJECTED'),
    allowNull: false
  })
  status: string;

  /*
  @ApiProperty()
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  publishedAt: Date;
*/
  @ApiProperty()
  @BelongsTo(() => Subject)
  subject: Subject;

  @ApiProperty({ type: () => User })
  @BelongsTo(() => User)
  user: User;

  @ApiProperty()
  @HasMany(() => LessonComment, { foreignKey: 'lessonId' })
  comments: LessonComment[];

  @ApiProperty()
  @HasMany(() => LessonTracking, { foreignKey: 'lessonId' })
  tracking: LessonTracking[];

  @ApiProperty()
  @HasMany(() => LessonTopic, { foreignKey: 'lessonId' })
  topics: LessonTopic[];




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
