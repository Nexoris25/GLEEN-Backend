import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeCreate,
  BeforeValidate,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { User } from 'src/user/models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { Subject } from 'src/subject/models/subject.model';
import { Quizzes } from 'src/lesson/models/quiz.model';

@Table({
  tableName: 'v_one_battle',
  timestamps: true,
  indexes: [
    {
      unique: true,
      name: 'unique_battle_per_week',
      fields: ['weekStart', 'subjectId', 'quizId', 'userId', 'opponentUserId'],
    },
  ],
})
export class V1Battle extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  duration?: string;

  @ApiProperty()
  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  questionCount?: number;

  @ApiProperty()
  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  winnerXP?: number;

  @ApiProperty()
  @Column({
    type: DataType.DOUBLE,
    allowNull: true,
  })
  participationXP?: number;

  @ApiProperty()
  @Default('PENDING')
  @Column({
    type: DataType.ENUM("ACCEPTED", "REJECTED", "PENDING"),
    allowNull: true,
  })
  acceptanceStatus?: "ACCEPTED" | "REJECTED" | "PENDING";

  @ApiProperty()
  @ForeignKey(() => Subject)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  subjectId?: string

  @ApiProperty()
  @ForeignKey(() => Quizzes)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  quizId?: string

  @ApiProperty()
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  userId?: string

  @ApiProperty()
  @ForeignKey(() => User)
  @Unique('unique_battle')
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  winnerUserId?: string


  @ApiProperty()
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  opponentUserId?: string

  @ApiProperty({ type: () => User })
  @BelongsTo(() => User, 'userId')
  user: User

  @ApiProperty()
  @BelongsTo(() => User, 'opponentUserId')
  opponentUser: User

  @ApiProperty({ description: 'ISO week start (Monday) for uniqueness per week', example: '2025-10-20' })
  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  weekStart?: string;


  @BeforeValidate
  static ensureWeekStart(instance: V1Battle) {
    if (!instance.weekStart) {
      const now = new Date();
      instance.weekStart = V1Battle.getIsoWeekStartDateOnly(now);
    }
  }

  @BeforeCreate
  static async setUserId(instance: V1Battle, options: { [key: string]: any }) {
    const authUserId = options.userId;
    if (!authUserId) {
      throw new Error('Authenticated user ID is not available');
    }
    instance.userId = authUserId;
    // Ensure weekStart exists even if BeforeValidate didn’t run for some reason
    if (!instance.weekStart) {
      instance.weekStart = V1Battle.getIsoWeekStartDateOnly(new Date());
    }
  }

  // Helper: compute Monday (UTC) of the week and return YYYY-MM-DD
  private static getIsoWeekStartDateOnly(date: Date): string {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = d.getUTCDay(); // 0=Sun, 1=Mon, ... 6=Sat
    const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
    d.setUTCDate(d.getUTCDate() + diff);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }

}
