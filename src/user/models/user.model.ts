import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { State } from '../../states/models/state.model';
import {
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
  BeforeCreate,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Exclude } from 'class-transformer';
import { RoleEnum } from '../../shared-types/RoleEnum';
import { UserStatusEnum } from '../../shared-types/UserStatusEnum';
import { Goal } from 'src/goal/models/goal.model';
import { UserGoal } from 'src/goal/models/user-goal.model';
import { Subject } from 'src/subject/models/subject.model';
import { UserSubject } from 'src/subject/models/user-subject.model';
import { City } from 'src/states/models/city.model';
import { Group } from 'src/study-crew/models/group.model';
import { UserGroup } from 'src/study-crew/models/user-group.model';
import { SubscriptionTransaction } from 'src/subscription/models/subscription-transaction.model';
import { QuizRecord } from 'src/lesson/models/quiz-record.model';
import { Lesson } from 'src/lesson/models/lesson.model';
import { LessonTracking } from 'src/lesson/models/lesson_tracking.model';
import { MockExamRecord } from 'src/mock-exam/models/mock-exam-record.model';
import { XpRecords } from 'src/xp/models/xp-record.model';

import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  username!: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  referral?: string;


  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  guardianEmail?: string;

  @ApiProperty()
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  isSubscribed?: boolean;

  @ApiProperty()
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  subscriptionStartDate?: Date;

  @ApiProperty()
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  subscriptionEndDate?: Date;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  subscriptionType?: string;

  @ApiProperty()
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  automaticSubscriptionRenewal?: boolean;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  fullName: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  gender: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  country: string;


  @ApiProperty()
  @ForeignKey(() => City)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  cityId: string;

  @Exclude()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;



@ApiPropertyOptional()
@Column({
type: DataType.UUID,
allowNull: true,
})
stateId?: string;

@ApiPropertyOptional()
@Column({
type: DataType.UUID,
allowNull: true,
})
lga?: string;


@ApiProperty()
@Default(false)
@Column({
  type: DataType.BOOLEAN,
  allowNull: false,
})
isEmailVerified: boolean;


  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @ApiProperty({ default: RoleEnum.USER })
  @Default(RoleEnum.USER)
  @Column(
    DataType.ENUM(
      RoleEnum.SUPER_ADMIN,
      RoleEnum.ADMIN,
      RoleEnum.TUTOR,
      RoleEnum.USER,
    ),
  )
  role!: RoleEnum;

  @ApiProperty({ default: UserStatusEnum.ACTIVE })
  @Default(UserStatusEnum.ACTIVE)
  @Column(
    DataType.ENUM(
      UserStatusEnum.ACTIVE,
      UserStatusEnum.INACTIVE,
      UserStatusEnum.SUSPENDED,
    ),
  )
  status!: UserStatusEnum;

  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  provider: string;

  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  providerId: string;

    @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  systemAvatar: string;

  @ApiPropertyOptional()
  @ForeignKey(() => SubscriptionTransaction)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  lastSubscriptionTransactionId: string;

  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  avatar: string;

  @ApiPropertyOptional()
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLoginAt: Date;

  @ApiPropertyOptional()
  @BelongsToMany(() => Goal,
    {
      through: () => UserGoal,
      foreignKey: 'userId',
      otherKey: 'goalId'
    })
  goals: Goal[];

  @ApiPropertyOptional()
  @BelongsToMany(() => Group,
    {
      through: () => UserGroup,
      foreignKey: 'userId',
      otherKey: 'groupId'
    })
  groups: Group[];

  @ApiPropertyOptional()
  @BelongsToMany(() => Subject,
    {
      through: () => UserSubject,
      foreignKey: 'userId',
      otherKey: 'subjectId'
    })
  subjects?: Subject[];




  @ApiPropertyOptional()
  @BelongsTo(() => SubscriptionTransaction, 'lastSubscriptionTransactionId')
  lastSubscriptionTransaction: SubscriptionTransaction;




  @ApiPropertyOptional()
  @BelongsTo(() => City)
  city: City;

  @ApiPropertyOptional()
  @HasMany(() => QuizRecord, 'userId')
  quizRecords: QuizRecord[];

  @ApiPropertyOptional()
  @BelongsToMany(() => Lesson, { through: () => LessonTracking, foreignKey: 'userId', otherKey: 'lessonId' })
  lessons: Lesson[];

  // @ApiPropertyOptional()
  @HasMany(() => LessonTracking, 'userId')
  lessonTrackings: LessonTracking[];

  // @ApiPropertyOptional()
  @HasMany(() => MockExamRecord, 'userId')
  mockExamRecords: MockExamRecord[];

  // @ApiPropertyOptional()
  @HasMany(() => XpRecords, 'userId')
  xpRecords: XpRecords[];

  

}


