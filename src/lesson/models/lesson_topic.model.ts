import { ApiProperty } from '@nestjs/swagger';
import {
BeforeCreate,
BelongsTo,
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
import { TopicTypeEnum, } from 'src/shared-types/FileTypeEnum';
import { User } from 'src/user/models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { Lesson } from './lesson.model';
import { LessonTracking } from './lesson_tracking.model';


@Table({
tableName: 'lesson_topics',
timestamps: true,
})
export class LessonTopic extends Model {
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

// @ApiProperty()
@ForeignKey(() => User)
@Column({
type: DataType.UUID,
allowNull: false,
})
userId: string;


@ApiProperty({
enum: ['PENDING', 'APPROVED', 'REJECTED'],
example: 'PENDING',
})
@Column({
type: DataType.ENUM('PENDING', 'APPROVED', 'REJECTED'),
allowNull: false,
defaultValue: 'PENDING',
})
status: 'PENDING' | 'APPROVED' | 'REJECTED';


@ApiProperty()
@Column({
type: DataType.STRING,
allowNull: false,
})
title: string;


@ApiProperty({
description: 'Duration in seconds',
example: 120,
minimum: 0,
})
@Column({
type: DataType.INTEGER,
allowNull: false,           // ← makes it required in database
defaultValue: 0,            // optional but often useful
})
duration: number;

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
@Column({
type: DataType.STRING,
allowNull: true,
})
videoOrFileUrl: string;

@ApiProperty()
@Column({
type: DataType.STRING,
allowNull: true,
})
videoCaptionUrl: string;


@ApiProperty({
  enum: TopicTypeEnum,
  example: TopicTypeEnum.VIDEO,
  description: 'Type of the topic, either VIDEO or TEXT',
})
@Column({
  type: DataType.ENUM(...Object.values(TopicTypeEnum)),
  allowNull: false,
  defaultValue: TopicTypeEnum.TEXT, // default to TEXT
})
topicType: TopicTypeEnum;


// @ApiProperty()
@BelongsTo(() => Lesson)
lesson: Lesson;

@ApiProperty()
@HasMany(() => LessonTracking, { foreignKey: 'lessonTopicId' })
tracking: LessonTracking[];

// @ApiProperty()
@BelongsTo(() => User)
user: User;

@BeforeCreate
static async setUserId(instance: LessonTopic, options: { [key: string]: any }) {

// Retrieve the authenticated user ID
const authUserId = options.userId;
if (!authUserId) {
throw new Error('Authenticated user ID is not available');
}
instance.userId = authUserId;
}
}
