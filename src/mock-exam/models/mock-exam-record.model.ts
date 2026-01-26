import { ApiProperty } from '@nestjs/swagger';
import {
    BeforeCreate,
    BeforeValidate,
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
    Unique,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { MockExams } from './mock-exam.model';
import { User } from 'src/user/models/user.model';
import { StudentsMockAnswers } from './students-mock-answers.model';

@Table({
    tableName: 'mock_exam_records',
    timestamps: true,
    indexes: [
        {
            unique: true,
            name: 'unique_user_mock_exam_per_week',
            fields: ['mockExamId', 'userId', 'weekStart'],
        },
    ],
})
export class MockExamRecord extends Model {
    @ApiProperty()
    @Default(() => uuidv4())
    @IsUUID(4)
    @PrimaryKey
    @Column(DataType.UUID)
    id: string;

    @ApiProperty()
    @Column({
        type: DataType.DOUBLE,
        allowNull: true,
    })
    totalMarks?: number;

    @ApiProperty()
    @Column({
        type: DataType.DOUBLE,
        allowNull: true,
    })
    obtainedMarks?: number;

    @ApiProperty()
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    totalQuestions?: number;

    @ApiProperty()
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    totalAnsweredQuestions?: number;

    @ApiProperty()
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    totalUnansweredQuestions?: number;

    @ApiProperty()
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    correctAnswers?: number;

    @ApiProperty()
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    incorrectAnswers?: number;

    @ApiProperty()
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    endedAt?: string;

    @ApiProperty()
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    startedAt?: string;


    @ApiProperty()
    @ForeignKey(() => MockExams)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    mockExamId: string

    @BelongsTo(() => MockExams, "mockExamId")
    mockExam: MockExams

    // @ApiProperty()
    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    userId?: string

    @ApiProperty()
    @HasMany(() => StudentsMockAnswers, 'mockExamRecordId')
    studentsMockAnswers: StudentsMockAnswers[];


    @ApiProperty({ description: 'ISO week start (Monday) for uniqueness per week', example: '2025-10-20' })
    @Column({
        type: DataType.DATEONLY,
        allowNull: true,
    })
    weekStart?: string;


    @BeforeValidate
    static ensureWeekStart(instance: MockExamRecord) {
        if (!instance.weekStart) {
            const now = new Date();
            instance.weekStart = MockExamRecord.getIsoWeekStartDateOnly(now);
        }
    }

    @BeforeCreate
    static async setUserId(instance: MockExamRecord, options: { [key: string]: any }) {
        const authUserId = options.userId;
        if (!authUserId) {
            throw new Error('Authenticated user ID is not available');
        }
        instance.userId = authUserId;
        // Ensure weekStart exists even if BeforeValidate didn’t run for some reason
        if (!instance.weekStart) {
            instance.weekStart = MockExamRecord.getIsoWeekStartDateOnly(new Date());
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
