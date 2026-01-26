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
import { User } from 'src/user/models/user.model';
import { Quizzes } from './quiz.model';
import { StudentsQuizAnswers } from './students_quiz_answers';

@Table({
    tableName: 'quiz_records',
    timestamps: true,
    indexes: [
        {
            unique: true,
            name: 'unique_user_quiz_per_week',
            fields: ['quizId', 'userId', 'weekStart'],
        },
    ],
})
export class QuizRecord extends Model {
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
    @ForeignKey(() => Quizzes)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    quizId: string


    @BelongsTo(()=>Quizzes, "quizId")
    quizzes: Quizzes;

    // @ApiProperty()
    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    userId?: string

    @ApiProperty()
    @HasMany(() => StudentsQuizAnswers, 'quizRecordId')
    studentsQuizAnswers: StudentsQuizAnswers[];


    @ApiProperty({ description: 'ISO week start (Monday) for uniqueness per week', example: '2025-10-20' })
    @Column({
        type: DataType.DATEONLY,
        allowNull: true,
    })
    weekStart?: string;


    @BeforeValidate
    static ensureWeekStart(instance: QuizRecord) {
        if (!instance.weekStart) {
            const now = new Date();
            instance.weekStart = QuizRecord.getIsoWeekStartDateOnly(now);
        }
    }

    @BeforeCreate
    static async setUserId(instance: QuizRecord, options: { [key: string]: any }) {
        const authUserId = options.userId;
        if (!authUserId) {
            throw new Error('Authenticated user ID is not available');
        }
        instance.userId = authUserId;
        // Ensure weekStart exists even if BeforeValidate didn’t run for some reason
        if (!instance.weekStart) {
            instance.weekStart = QuizRecord.getIsoWeekStartDateOnly(new Date());
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
