// src/metrics/services/metrics.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { ClassEntity } from '../../classes/entities/class.entity';
import { Lesson } from '../../lesson/models/lesson.model';
import { Quizzes } from '../../lesson/models/quiz.model';
import { StudentsQuizAnswers } from '../../lesson/models/students_quiz_answers';
import { MockExams } from '../../mock-exam/models/mock-exam.model';
import { Op } from 'sequelize';
import { DashboardQueryDto } from '../dto/dashboard-query.dto';
import { RoleEnum } from 'src/shared-types/RoleEnum';

@Injectable()
export class MetricsService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(ClassEntity) private readonly classModel: typeof ClassEntity,
    @InjectModel(Lesson) private readonly lessonModel: typeof Lesson,
    @InjectModel(Quizzes) private readonly quizModel: typeof Quizzes,
    @InjectModel(MockExams) private readonly mockExamModel: typeof MockExams,
    @InjectModel(StudentsQuizAnswers)
    private readonly studentsQuizModel: typeof StudentsQuizAnswers,
    private sequelize: Sequelize,
  ) {}

  private parseDateRange(params: { startDate: string; endDate: string }) {
    const start = new Date(params.startDate);
    const end = new Date(params.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Invalid startDate or endDate');
    }

    if (start > end) {
      throw new BadRequestException('startDate must be before endDate');
    }

    return { start, end };
  }

  async getMetrics() {
    // ✅ Total counts
    const totalUsers = await this.userModel.count();
    const totalClasses = await this.classModel.count();
    const totalQuizAnswers = await this.studentsQuizModel.count();

    return {
      totalUsers,
      totalClasses,
      totalQuizAnswers,
    };
  }

  async getStudentGrowth(params: { startDate: string; endDate: string }) {
    const { start, end } = this.parseDateRange(params);

    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;

    const weekdayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    let granularity: 'daily' | 'weekly' | 'monthly';

    if (days <= 7) {
      granularity = 'daily';
    } else if (days < 60) {
      granularity = 'weekly';
    } else {
      granularity = 'monthly';
    }

    if (granularity === 'daily') {
      const [rows] = await this.sequelize.query(
        `
        SELECT
          DATE_TRUNC('day', "createdAt") AS bucket,
          COUNT(*)::int AS count
        FROM "users"
        WHERE "role" = 'USER'
          AND "createdAt" BETWEEN :start AND :end
        GROUP BY bucket
        ORDER BY bucket ASC
        `,
        {
          replacements: { start, end },
        },
      );

      const points = (rows as any[]).map((row) => {
        const bucketDate = new Date(row.bucket);
        const bucketStart = bucketDate.toISOString();
        const bucketEnd = new Date(
          bucketDate.getTime() + msPerDay - 1,
        ).toISOString();

        return {
          label: weekdayNames[bucketDate.getUTCDay()],
          bucketStart,
          bucketEnd,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          count: row.count,
        };
      });

      return {
        granularity,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        points,
      };
    }

    if (granularity === 'weekly') {
      const [rows] = await this.sequelize.query(
        `
        SELECT
          DATE_TRUNC('week', "createdAt") AS bucket,
          COUNT(*)::int AS count
        FROM "users"
        WHERE "role" = 'USER'
          AND "createdAt" BETWEEN :start AND :end
        GROUP BY bucket
        ORDER BY bucket ASC
        `,
        {
          replacements: { start, end },
        },
      );

      const points = (rows as any[]).map((row, index) => {
        const bucketDate = new Date(row.bucket);
        const bucketStart = bucketDate.toISOString();
        const bucketEnd = new Date(
          bucketDate.getTime() + msPerDay * 7 - 1,
        ).toISOString();

        return {
          label: `Week ${index + 1}`,
          bucketStart,
          bucketEnd,
          count: row.count,
        };
      });

      return {
        granularity,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        points,
      };
    }

    const [rows] = await this.sequelize.query(
      `
      SELECT
        DATE_TRUNC('month', "createdAt") AS bucket,
        COUNT(*)::int AS count
      FROM "users"
      WHERE "role" = 'USER'
        AND "createdAt" BETWEEN :start AND :end
      GROUP BY bucket
      ORDER BY bucket ASC
      `,
      {
        replacements: { start, end },
      },
    );

    const points = (rows as any[]).map((row) => {
      const bucketDate = new Date(row.bucket);
      const year = bucketDate.getUTCFullYear();
      const month = `${bucketDate.getUTCMonth() + 1}`.padStart(2, '0');

      const bucketStart = new Date(
        Date.UTC(bucketDate.getUTCFullYear(), bucketDate.getUTCMonth(), 1),
      );

      const nextMonth = new Date(
        Date.UTC(bucketDate.getUTCFullYear(), bucketDate.getUTCMonth() + 1, 1),
      );
      const bucketEnd = new Date(nextMonth.getTime() - 1);

      return {
        label: `${year}-${month}`,
        bucketStart: bucketStart.toISOString(),
        bucketEnd: bucketEnd.toISOString(),
        count: row.count,
      };
    });

    return {
      granularity,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      points,
    };
  }

  async getDashboard(params: DashboardQueryDto) {
    const { start, end } = this.parseDateRange(params);

    const summaryWhere = {
      createdAt: {
        [Op.between]: [start, end],
      },
    };

    const [totalUsers, totalLessons, totalQuizzes, studentGrowth, students] =
      await Promise.all([
        this.userModel.count({ where: summaryWhere }),
        this.lessonModel.count({ where: summaryWhere }),
        this.quizModel.count({ where: summaryWhere }),
        this.getStudentGrowth(params),
        this.userModel.findAll({
          where: {
            role: RoleEnum.USER,
            createdAt: {
              [Op.between]: [start, end],
            },
            // Only students who have completed their profile (name + gender),
            // matching how users are fetched in UserService.findAll.
            fullName: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] },
            gender: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] },
          },
          attributes: [
            'id',
            'avatar',
            'systemAvatar',
            'fullName',
            'email',
            'status',
          ],
          order: [['createdAt', 'DESC']],
        }),
      ]);

    const mockExamGrowthRows = await this.mockExamModel.sequelize.query(
      `
        SELECT
          me.id::text AS id,
          me.title AS name,
          COALESCE(
            ROUND(
              (CASE
                WHEN COALESCE(SUM(mer."totalMarks"), 0) > 0
                  THEN (COALESCE(SUM(mer."obtainedMarks"), 0) / SUM(mer."totalMarks")) * 100
                ELSE 0
              END)::numeric
            , 2),
            0
          ) AS "growthPercentage"
        FROM "mock_exams" me
        LEFT JOIN "mock_exam_records" mer
          ON mer."mockExamId" = me.id
          AND mer."createdAt" BETWEEN :start AND :end
        GROUP BY me.id, me.title
        ORDER BY me.title ASC
      `,
      {
        replacements: { start, end },
      },
    );

    const studentsTable = students.map((student) => ({
      id: student.id,
      image: student.avatar || student.systemAvatar || null,
      name: student.fullName,
      email: student.email,
      status: student.status,
    }));

    const [mockExamGrowthRaw] = mockExamGrowthRows as unknown as [
      Array<{ id: string; name: string; growthPercentage: string | number }>,
      unknown,
    ];

    return {
      summary: {
        totalUsers,
        totalLessons,
        totalQuizzes,
      },
      studentGrowth: {
        granularity: studentGrowth.granularity,
        points: studentGrowth.points,
      },
      students: studentsTable,
      mockExams: (mockExamGrowthRaw || []).map((item) => ({
        id: item.id,
        name: item.name,
        growthPercentage: Math.max(
          0,
          Math.min(100, Number(item.growthPercentage) || 0),
        ),
      })),
    };
  }
}
