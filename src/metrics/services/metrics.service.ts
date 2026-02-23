// src/metrics/services/metrics.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { ClassEntity } from '../../classes/entities/class.entity';
import { StudentsQuizAnswers } from '../../lesson/models/students_quiz_answers';

@Injectable()
export class MetricsService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(ClassEntity) private readonly classModel: typeof ClassEntity,
    @InjectModel(StudentsQuizAnswers)
    private readonly studentsQuizModel: typeof StudentsQuizAnswers,
    private sequelize: Sequelize,
  ) {}

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
    const start = new Date(params.startDate);
    const end = new Date(params.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Invalid startDate or endDate');
    }

    if (start > end) {
      throw new BadRequestException('startDate must be before endDate');
    }

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
}
