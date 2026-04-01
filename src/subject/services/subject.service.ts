import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, UniqueConstraintError, literal } from 'sequelize';
import { Subject } from '../models/subject.model';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import { User } from 'src/user/models/user.model';
import { BunnyService } from 'src/common/services/bunny-all.service';
import stringify from 'safe-stable-stringify';
import { UserSubject } from '../models/user-subject.model';
import { validate as isUUID } from 'uuid';
import { LessonQueryDto } from 'src/lesson/dto/query.dto';
import { SubjectStudentsQueryDto } from '../dto/subject-students-query.dto';

@Injectable()
export class SubjectService {
  constructor(
    @InjectModel(Subject)
    private readonly subjectModel: typeof Subject,
    private readonly bunnyService: BunnyService,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(UserSubject)
    private readonly userSubjectModel: typeof UserSubject,
  ) {}

  private readonly MAX_LIMIT = 500;

  generateAvatarUploadTarget(mimeType?: string) {
    return this.bunnyService.generateUploadTarget({
      directory: 'subjects',
      mimeType,
    });
  }

  async create(dto: CreateSubjectDto, authUserId: string): Promise<Subject> {
    // Validate tutor
    if (dto.tutorId) {
      const tutor = await this.userModel.findOne({
        where: { id: dto.tutorId, role: 'TUTOR' },
      });

      if (!tutor) {
        throw new BadRequestException(
          `Tutor with id ${dto.tutorId} does not exist or is not a tutor`,
        );
      }
    }

    const subjectData: Partial<Subject> = {
      ...dto,
      userId: authUserId,
    };

    try {
      return await this.subjectModel.create(subjectData);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const field = error.errors[0]?.path || 'Unknown field';
        throw new ConflictException(
          `A subject with this ${field} already exists`,
        );
      }
      throw error;
    }
  }

  async findById(id: string) {
    const subject = await this.subjectModel.findByPk(id);
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async update(id: string, dto: UpdateSubjectDto) {
    const subject = await this.findById(id);

    if (dto.tutorId) {
      const tutor = await this.userModel.findByPk(dto.tutorId);
      if (!tutor)
        throw new BadRequestException(
          `Tutor with ID '${dto.tutorId}' not found`,
        );

      const tutor1 = await this.userModel.findOne({
        where: { id: dto.tutorId, role: 'TUTOR' },
      });
      if (!tutor1) {
        throw new BadRequestException(
          `Tutor with id ${dto.tutorId} does not exist or is not a tutor`,
        );
      }
    }

    const updatedData: any = { ...dto };

    if (dto.avatar !== undefined && dto.avatar !== subject.avatar) {
      if (subject.avatar) {
        await this.bunnyService.deleteByUrl(subject.avatar);
      }
    }
    try {
      return await subject.update(updatedData);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const field = error.errors[0]?.path || 'Unknown field';
        throw new ConflictException(
          `A subject with this ${field} already exists`,
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid subject ID');
    }

    try {
      const subject = await this.subjectModel.findByPk(id);

      if (!subject) {
        throw new NotFoundException('Subject not found');
      }

      if (subject.avatar) {
        await this.bunnyService.deleteByUrl(subject.avatar);
      }

      await subject.destroy(); // soft delete (paranoid: true)
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to delete subject');
    }
  }

  async restore(id: string) {
    const subject = await this.subjectModel.findOne({
      where: { id },
      paranoid: false,
    });
    if (!subject) throw new NotFoundException('Subject not found');
    await subject.restore();
    return subject;
  }

  async search(options: { search?: string; limit?: number; offset?: number }) {
    const { search, limit, offset } = options;

    const isUUID =
      search &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        search,
      );

    const where = search
      ? {
          [Op.or]: [
            ...(isUUID ? [{ id: search }] : []), // ✅ exact UUID match
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    return this.subjectModel.findAll({
      where,
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'tutor',
          attributes: ['id', 'fullName', 'avatar'],
        },
      ],
    });
  }

  /*
  async search(query: string) {
    return this.subjectModel.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { userId: { [Op.iLike]: `%${query}%` } },
          { tutorId: { [Op.iLike]: `%${query}%` } },
        ],
      },
    });
  }
  */

  async findAllWithDetails(query?: LessonQueryDto) {
    const limit = Math.min(query?.limit ?? 10, this.MAX_LIMIT);
    const offset = query?.offset ?? 0;

    // 🔹 Dynamic WHERE
    const where: any = {};
    if (query?.id) where.id = query.id;

    if (query?.title || query?.description) {
      where[Op.or] = [
        query?.title && { title: { [Op.iLike]: `%${query.title}%` } },
        query?.description && {
          description: { [Op.iLike]: `%${query.description}%` },
        },
      ].filter(Boolean);
    }

    const result = await this.subjectModel.findAndCountAll({
      where,
      attributes: {
        include: [
          // 🔹 Total students linked to subject
          [
            literal(`(
            SELECT COUNT(DISTINCT us."userId")
            FROM "users_subjects" us
            WHERE us."subjectId" = "Subject"."id"
          )`),
            'totalStudents',
          ],

          // 🔹 Last 4 students (lesson-style JSON aggregation)
          [
            literal(`(
            SELECT COALESCE(json_agg(u ORDER BY u.joined_at DESC), '[]'::json)
            FROM (
              SELECT
                usr.id,
                usr."fullName",
                usr.avatar,
                MAX(us."createdAt") AS joined_at
              FROM "users_subjects" us
              JOIN "users" usr ON usr.id = us."userId"
              WHERE us."subjectId" = "Subject"."id"
              GROUP BY usr.id, usr."fullName", usr.avatar
              ORDER BY joined_at DESC
              LIMIT 4
            ) u
          )`),
            'recentStudents',
          ],
          [
            literal(`(
        SELECT json_build_object(
          'id', usr.id,
          'fullName', usr."fullName",
          'avatar', usr.avatar
        )
        FROM "users" usr
        WHERE usr.id = "Subject"."tutorId"
        LIMIT 1
      )`),
            'tutor',
          ],
        ],
      },
      order: [['createdAt', 'DESC']],
      limit: query?.id ? undefined : limit,
      offset: query?.id ? undefined : offset,
      subQuery: false,
    });

    // 🔹 Single subject mode
    if (query?.id) {
      if (!result.rows.length) {
        throw new NotFoundException(`Subject with id ${query.id} not found`);
      }
      return result.rows[0];
    }

    // 🔹 Pagination metadata
    const total = Array.isArray(result.count)
      ? result.count.reduce((sum, item) => sum + Number(item.count), 0)
      : result.count;

    return {
      data: result.rows,
      meta: {
        totalItems: total,
        limit,
        offset,
        currentCount: result.rows.length,
        hasNext: offset + limit < total,
        hasPrevious: offset > 0,
      },
    };
  }

  async findAll(search?: string): Promise<Subject[]> {
    try {
      const where: any = {};
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { id: { [Op.iLike]: `%${search}%` } },
        ];
      }
      return await this.subjectModel.findAll({ where });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching subjects',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findOne(id: string): Promise<Subject> {
    try {
      const subject = await this.subjectModel.findByPk(id);
      if (!subject) {
        throw new NotFoundException(`Subject with ID ${id} not found`);
      }
      return subject;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching subject',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  /*
  async update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<Subject> {
    try {
      const subject = await this.findOne(id);
      return await subject.update(updateSubjectDto);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating subject',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
*/

  async linkOne(userId: string, subjectId: string) {
    try {
      return await this.userSubjectModel.create({ userId, subjectId });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error linking subject to user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async linkMany(userId: string, subjectIds: string[]) {
    try {
      const records = subjectIds.map((subjectId) => ({ userId, subjectId }));
      return await this.userSubjectModel.bulkCreate(records, {
        ignoreDuplicates: true,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error linking multiple subjects to user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async unlinkOne(userId: string, subjectId: string) {
    try {
      return await this.userSubjectModel.destroy({
        where: { userId, subjectId },
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error unlinking subject from user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async unlinkMany(userId: string, subjectIds: string[]) {
    try {
      return await this.userSubjectModel.destroy({
        where: { userId, subjectId: subjectIds },
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error unlinking multiple subjects from user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async getUserSubjects(
    userId: string,
    options?: {
      search?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const { search, limit, offset } = options || {};

    const where = search
      ? {
          [Op.or]: [
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    // 1️⃣ Fetch subjects
    const subjects = await this.subjectModel.findAll({
      where,
      limit,
      offset,

      attributes: {
        include: [
          // ✅ total students count
          [
            literal(`(
            SELECT COUNT(*)
            FROM "users_subjects" us
            WHERE us."subjectId" = "Subject"."id"
          )`),
            'studentsCount',
          ],
        ],
      },

      include: [
        // 🔐 only subjects assigned to this user
        {
          model: User,
          as: 'users',
          attributes: [],
          through: { attributes: [] },
          where: { id: userId },
          required: true,
        },

        // 👨‍🏫 tutor
        {
          model: User,
          as: 'tutor',
          attributes: ['id', 'fullName', 'avatar'],
        },
      ],
    });

    // 2️⃣ Fetch first 4 students with avatar PER subject
    const subjectsWithStudents = await Promise.all(
      subjects.map(async (subject) => {
        const students = await this.userModel.findAll({
          attributes: ['id', 'fullName', 'avatar'],
          include: [
            {
              model: Subject,
              attributes: [],
              through: { attributes: [] },
              where: { id: subject.id },
            },
          ],
          where: {
            avatar: { [Op.ne]: null },
          },
          limit: 4,
        });

        return {
          ...subject.toJSON(),
          studentsPreview: students,
        };
      }),
    );

    return subjectsWithStudents;
  }

  async getStudentsForSubject(
    subjectId: string,
    query: SubjectStudentsQueryDto,
  ) {
    if (!isUUID(subjectId)) {
      throw new BadRequestException('Invalid subject ID');
    }

    const subject = await this.subjectModel.findByPk(subjectId);
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    const limit = Math.min(query?.limit ?? 10, this.MAX_LIMIT);
    const offset = query?.offset ?? 0;
    const search = query?.search?.trim();

    const where: any = {};
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const conversionTypes = `'AIRTIME_CONVERSION','SUBSCRIPTION_RENEWAL'`;

    const result = await this.userModel.findAndCountAll({
      where,
      include: [
        {
          model: Subject,
          as: 'subjects',
          attributes: [],
          through: { attributes: [] },
          where: { id: subjectId },
          required: true,
        },
      ],
      attributes: {
        exclude: ['password'],
        include: [
          [
            literal(`(
              SELECT COUNT(*)
              FROM "lesson_trackings" lt
              INNER JOIN "lessons" l ON l."id" = lt."lessonId"
              WHERE lt."userId" = "User"."id"
                AND l."subjectId" = '${subjectId}'
                AND lt."dateCompleted" IS NOT NULL
            )`),
            'lessonsCount',
          ],
          [
            literal(`(
              SELECT COUNT(*)
              FROM "quiz_records" qr
              INNER JOIN "quizzes" q ON q."id" = qr."quizId"
              WHERE qr."userId" = "User"."id"
                AND q."subjectId" = '${subjectId}'
            )`),
            'quizCount',
          ],
          [
            literal(`(
              SELECT COUNT(*)
              FROM "mock_exam_records" mer
              INNER JOIN "mock_exams" me ON me."id" = mer."mockExamId"
              WHERE mer."userId" = "User"."id"
                AND me."subjectId" = '${subjectId}'
            )`),
            'mockExamsCount',
          ],
          [
            literal(`(
              SELECT COALESCE(xr."currentXpValue", 0)
              FROM "xp_records" xr
              WHERE xr."userId" = "User"."id"
              ORDER BY xr."updatedAt" DESC
              LIMIT 1
            )`),
            'totalRewards',
          ],
          [
            literal(`(
              SELECT json_build_object(
                'xpType', xl."xpType",
                'xpValue', xl."xpValue",
                'detail', xl."detail",
                'createdAt', xl."createdAt"
              )
              FROM "xp_logs" xl
              WHERE xl."userId" = "User"."id"
                AND xl."xpType" IN (${conversionTypes})
              ORDER BY xl."createdAt" DESC
              LIMIT 1
            )`),
            'rewardRequest',
          ],
          [
            literal(`(
              SELECT COUNT(*)
              FROM "xp_logs" xl
              WHERE xl."userId" = "User"."id"
                AND xl."xpType" IN (${conversionTypes})
            )`),
            'rewardRequestCount',
          ],
        ],
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      subQuery: false,
    });

    const total = Array.isArray(result.count)
      ? result.count.reduce((sum, item) => sum + Number(item.count), 0)
      : result.count;

    return {
      subject: {
        id: subject.id,
        title: subject.title,
      },
      data: result.rows,
      meta: {
        totalItems: total,
        limit,
        offset,
        currentCount: result.rows.length,
        hasNext: offset + limit < total,
        hasPrevious: offset > 0,
      },
    };
  }
}
