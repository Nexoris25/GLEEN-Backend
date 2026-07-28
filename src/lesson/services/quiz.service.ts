import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import stringify from 'safe-stable-stringify';
import { literal } from 'sequelize';
import { Quizzes } from '../models/quiz.model';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { SearchQuizDto } from '../dto/search-quiz.dto';
import { UpdateQuizDto } from '../dto/udpdate-quiz.dto';
import { CreateQuizCommentDto } from '../dto/create-quiz-comment.dto';
import { QuizComment } from '../models/quiz_comment.model';
import { UpdateQuizCommentDto } from '../dto/update-quiz-comment.dto';
import type {
  MostTakenQuizzesQueryDto,
  QuizSubjectsQueryDto,
} from '../dto/query.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quizzes)
    private quizzesModel: typeof Quizzes,
    @InjectModel(QuizComment)
    private quizCommentModel: typeof QuizComment,
  ) {}

  async create(createDto: CreateQuizDto, userId: string): Promise<Quizzes> {
    // 1️⃣ Check if a quiz with the same title already exists
    const existingQuiz = await this.quizzesModel.findOne({
      where: { title: createDto.title },
    });

    if (existingQuiz) {
      throw new BadRequestException(
        `A quiz with the title "${createDto.title}" already exists.`,
      );
    }

    try {
      const quiz = await this.quizzesModel.create(
        {
          ...createDto,
          userId, // logged-in user
          avatar: createDto.avatar ?? null,
        } as Omit<Quizzes, 'id'>,
        {
          isNewRecord: true,
          userId,
        },
      );

      return quiz;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating quiz:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(
    options: SearchQuizDto,
  ): Promise<{ rows: any[]; count: number }> {
    try {
      const limit = Math.min(options?.limit ?? 10, 500);
      const offset = Math.max(options?.offset ?? 0, 0);

      const sequelize = this.quizzesModel.sequelize as any;

      // Only surface quizzes that actually have questions.
      const conditions: string[] = [
        `EXISTS (SELECT 1 FROM "quiz_questions" qq WHERE qq."quizId" = q.id)`,
      ];
      const replacements: Record<string, any> = { limit, offset };

      if (options?.userId) {
        conditions.push(`q."userId" = :userId`);
        replacements.userId = options.userId;
      }
      if (options?.subjectId) {
        conditions.push(`q."subjectId" = :subjectId`);
        replacements.subjectId = options.subjectId;
      }
      if (options?.status) {
        conditions.push(`q.status = :status`);
        replacements.status = options.status;
      }
      if (options?.title) {
        conditions.push(`q.title ILIKE :title`);
        replacements.title = `%${options.title}%`;
      }
      if (options?.description) {
        conditions.push(`q.description ILIKE :description`);
        replacements.description = `%${options.description}%`;
      }

      const whereClause = `WHERE ${conditions.join('\n          AND ')}`;

      const [countRows] = (await sequelize.query(
        `
          SELECT COUNT(*)::int AS total
          FROM "quizzes" q
          ${whereClause};
        `,
        { replacements },
      )) as unknown as [{ total: number }[], unknown];

      const count = Number(countRows?.[0]?.total) || 0;

      const [rows] = (await sequelize.query(
        `
          SELECT
            q.id::text AS id,
            q.title AS title,
            q.description AS description,
            q.avatar AS avatar,
            q.duration AS duration,
            q.status AS status,
            q."subjectId"::text AS "subjectId",
            q."createdAt" AS "createdAt",
            s.title AS "subjectTitle",
            (
              SELECT COUNT(*)::int
              FROM "quiz_questions" qq
              WHERE qq."quizId" = q.id
            ) AS "questionCount",
            (
              SELECT COUNT(DISTINCT qr."userId")::int
              FROM "quiz_records" qr
              WHERE qr."quizId" = q.id
            ) AS "totalUsers",
            (
              SELECT COALESCE(json_agg(u), '[]'::json)
              FROM (
                SELECT usr.id, usr.avatar, MAX(qr."createdAt") AS last_seen
                FROM "quiz_records" qr
                JOIN "users" usr ON usr.id = qr."userId"
                WHERE qr."quizId" = q.id
                GROUP BY usr.id, usr.avatar
                ORDER BY last_seen DESC
                LIMIT 4
              ) u
            ) AS "recentUsers",
            CASE
              WHEN tu.id IS NULL THEN NULL
              ELSE json_build_object('id', tu.id, 'fullName', tu."fullName", 'avatar', tu.avatar)
            END AS "tutor"
          FROM "quizzes" q
          LEFT JOIN "subjects" s ON s.id = q."subjectId"
          LEFT JOIN "users" tu ON tu.id = q."userId"
          ${whereClause}
          ORDER BY q."createdAt" DESC
          LIMIT :limit OFFSET :offset;
        `,
        { replacements },
      )) as unknown as [any[], unknown];

      const normalizedRows = (rows || []).map((r) => ({
        ...r,
        duration: Number(r.duration) || 0,
        questionCount: Number(r.questionCount) || 0,
        totalUsers: Number(r.totalUsers) || 0,
        recentUsers: Array.isArray(r.recentUsers) ? r.recentUsers : [],
      }));

      return { rows: normalizedRows, count };
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching quizzes:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async getMostTakenQuizzes(userId: string, query?: MostTakenQuizzesQueryDto) {
    const offset = Math.max(query?.offset ?? 0, 0);
    const limit = Math.min(query?.limit ?? 10, 500);
    const search = typeof query?.search === 'string' ? query.search.trim() : '';

    const sequelize = this.quizzesModel.sequelize as any;

    const whereSearch = search
      ? `AND (
          q.title ILIKE :search
          OR q.description ILIKE :search
        )`
      : '';

    const [countRows] = (await sequelize.query(
      `
        SELECT COUNT(DISTINCT q.id)::int AS total
        FROM "quizzes" q
        JOIN "subjects" s ON s.id = q."subjectId"
        LEFT JOIN "quiz_records" qr
          ON qr."quizId" = q.id
          AND qr."userId" <> :userId
        WHERE q.status = 'APPROVED'
        ${whereSearch};
      `,
      {
        replacements: {
          userId,
          search: `%${search}%`,
        },
      },
    )) as unknown as [{ total: number }[], unknown];

    const total = Number(countRows?.[0]?.total) || 0;

    const [rows] = (await sequelize.query(
      `
        SELECT
          q.id::text AS id,
          q.title AS title,
          q.description AS description,
          q.avatar AS image,
          q.duration AS duration,
          q."subjectId"::text AS "subjectId",
          s.title AS "subjectTitle",
          COALESCE(COUNT(DISTINCT qr."userId"), 0)::int AS "takenCount",
          (
            SELECT COUNT(*)::int
            FROM "quiz_questions" qq
            WHERE qq."quizId" = q.id
          ) AS "questionCount"
        FROM "quizzes" q
        JOIN "subjects" s ON s.id = q."subjectId"
        LEFT JOIN "quiz_records" qr
          ON qr."quizId" = q.id
          AND qr."userId" <> :userId
        WHERE q.status = 'APPROVED'
        ${whereSearch}
        GROUP BY q.id, s.id
        ORDER BY "takenCount" DESC, q."createdAt" DESC
        LIMIT :limit OFFSET :offset;
      `,
      {
        replacements: {
          userId,
          search: `%${search}%`,
          limit,
          offset,
        },
      },
    )) as unknown as [any[], unknown];

    return {
      data: rows || [],
      meta: {
        totalItems: total,
        limit,
        offset,
        currentCount: (rows || []).length,
        hasNext: offset + limit < total,
        hasPrevious: offset > 0,
      },
    };
  }

  async getQuizSubjects(query?: QuizSubjectsQueryDto) {
    const offset = Math.max(query?.offset ?? 0, 0);
    const limit = Math.min(query?.limit ?? 10, 500);
    const search = typeof query?.search === 'string' ? query.search.trim() : '';

    const subjectIds =
      typeof query?.subjects === 'string'
        ? query.subjects
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    const sequelize = this.quizzesModel.sequelize as any;

    const whereSearch = search ? `AND s.title ILIKE :search` : '';
    const whereSubjects =
      subjectIds.length > 0 ? `AND s.id IN (:subjectIds)` : '';

    const [countRows] = (await sequelize.query(
      `
        SELECT COUNT(*)::int AS total
        FROM (
          SELECT s.id
          FROM "subjects" s
          JOIN "quizzes" q
            ON q."subjectId" = s.id
            AND q.status = 'APPROVED'
          WHERE 1=1
          ${whereSearch}
          ${whereSubjects}
          GROUP BY s.id
        ) x;
      `,
      {
        replacements: {
          search: `%${search}%`,
          subjectIds,
        },
      },
    )) as unknown as [{ total: number }[], unknown];

    const total = Number(countRows?.[0]?.total) || 0;

    const [rows] = (await sequelize.query(
      `
        SELECT
          s.id::text AS id,
          s.title AS title,
          s.description AS description,
          s.avatar AS avatar,
          COUNT(q.id)::int AS "quizCount"
        FROM "subjects" s
        JOIN "quizzes" q
          ON q."subjectId" = s.id
          AND q.status = 'APPROVED'
        WHERE 1=1
        ${whereSearch}
        ${whereSubjects}
        GROUP BY s.id
        ORDER BY "quizCount" DESC, s."createdAt" DESC
        LIMIT :limit OFFSET :offset;
      `,
      {
        replacements: {
          search: `%${search}%`,
          subjectIds,
          limit,
          offset,
        },
      },
    )) as unknown as [any[], unknown];

    return {
      data: rows || [],
      meta: {
        totalItems: total,
        limit,
        offset,
        currentCount: (rows || []).length,
        hasNext: offset + limit < total,
        hasPrevious: offset > 0,
      },
    };
  }

  async findById(id: string): Promise<Quizzes | null> {
    try {
      return await this.quizzesModel.findByPk(id, {
        attributes: {
          include: [
            [
              literal(
                '(SELECT COUNT(*) FROM "quiz_questions" AS "qq" WHERE "qq"."quizId" = "Quizzes"."id")',
              ),
              'questionCount',
            ],
          ],
        },
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching quiz by ID:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async update(id: string, updateDto: UpdateQuizDto): Promise<Quizzes | null> {
    try {
      const quiz = await this.quizzesModel.findByPk(id);

      if (!quiz) {
        throw new Error('Quiz not found');
      }

      const returnURL = await quiz.update({
        ...updateDto,
      });

      return returnURL;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating quiz:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const deletedCount = await this.quizzesModel.destroy({ where: { id } });
      return deletedCount > 0;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting quiz:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async createComment(
    createCommentDto: CreateQuizCommentDto,
    userId: string,
  ): Promise<QuizComment> {
    try {
      const comment = await this.quizCommentModel.create(
        { ...createCommentDto, userId },
        { isNewRecord: true, userId },
      );
      return comment;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating quiz comment',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findCommentById(id: string): Promise<QuizComment> {
    try {
      const comment = await this.quizCommentModel.findByPk(id);
      if (!comment) {
        throw new NotFoundException(`Comment with id ${id} not found`);
      }
      return comment;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error finding quiz comment',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findCommentByQuiz(
    quizId: string,
    offset: number,
    limit: number,
  ): Promise<{ count: number; rows: QuizComment[] }> {
    try {
      const comments = await this.quizCommentModel.findAndCountAll({
        where: { quizId },
        offset,
        limit,
      });
      return comments;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error finding quiz comments',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findCommentByQuizAndUser(
    quizId: string,
    userId: string,
  ): Promise<QuizComment | null> {
    try {
      const comment = await this.quizCommentModel.findOne({
        where: { quizId, userId },
      });
      return comment;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error finding quiz comment by quiz and user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async updateComment(
    id: string,
    updateCommentDto: UpdateQuizCommentDto,
  ): Promise<QuizComment> {
    try {
      const comment = await this.findCommentById(id);
      Object.assign(comment, updateCommentDto);
      return await comment.save();
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating quiz comment',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async removeComment(id: string): Promise<void> {
    try {
      const comment = await this.findCommentById(id);
      await comment.destroy();
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting quiz comment',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
