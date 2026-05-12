import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AdminWebPreferences, User } from '../models/user.model';
import * as jwt from 'jsonwebtoken';
import { Op, WhereOptions } from 'sequelize';
import { UserSearchDto } from '../dto/user-search.dto';
import { MailService } from '../../email/email.service';
import { UserStatusEnum } from '../../shared-types/UserStatusEnum';
import { RoleEnum } from '../../shared-types/RoleEnum';
import stringify from 'safe-stable-stringify';
import { XpLogService } from 'src/xp/services/xp-log.service';
import { Express } from 'express';
import { BunnyService } from 'src/common/services/bunny.service';
import { Subject } from 'src/subject/models/subject.model';
import { Goal } from 'src/goal/models/goal.model';
import { XpRecords } from 'src/xp/models/xp-record.model';

@Injectable()
export class UserService {
  private readonly MAX_LIMIT = 100; // optional max cap for pagination

  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(XpRecords)
    private readonly xpRecordsModel: typeof XpRecords,
    private readonly emailService: MailService,
    private readonly xpLogService: XpLogService,
    private readonly bunnyService: BunnyService,
  ) {}

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashedPassword = await this.hashPassword(newPassword);
    await this.userModel.update(
      { password: hashedPassword },
      { where: { id: userId } },
    );

    await this.emailService.resetPasswordSuccessfulEmail({
      userEmail: user.email,
      userName: user.username,
    });
  }

  async verifyEmail(userId: string): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userModel.update(
      { isEmailVerified: true },
      { where: { id: userId } },
    );
  }

  async verifyEmailV1(email: string): Promise<void> {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userModel.update(
      { isEmailVerified: true },
      { where: { email: { [Op.iLike]: email } } },
    );
  }

  // ✅ FIND ALL WITH PAGINATION AND FILTERS
  async findAll(searchDto: UserSearchDto) {
    try {
      const { offset = 0, limit = 10, ...searchParams } = searchDto;

      // Build WHERE filters
      const where: WhereOptions<User> = {};
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          switch (key) {
            case 'username':
            case 'email':
            case 'fullName':
            case 'guardianEmail':
            case 'referral':
              where[key] = { [Op.iLike]: `%${value}%` };
              break;
            case 'role':
              where[key] = RoleEnum[value as keyof typeof RoleEnum];
              break;
            case 'status':
              where[key] = UserStatusEnum[value as keyof typeof UserStatusEnum];
              break;
            default:
              where[key] = value;
          }
        }
      });

      // Safe pagination
      const safeLimit = Math.min(limit, this.MAX_LIMIT);
      const safeOffset = Math.max(offset, 0);

      // Fetch data with count
      const { rows, count } = await this.userModel.findAndCountAll({
        where,
        offset: safeOffset,
        limit: safeLimit,
        order: [['createdAt', 'DESC']],
        include: [
          { association: 'goals' },
          { association: 'subjects' },
          { association: 'city' },
          { association: 'quizRecords' },
          { association: 'lessons' },
          { association: 'lessonTrackings' },
          { association: 'mockExamRecords' },
          { association: 'xpRecords' },
        ],
      });

      // Add quizCount and lessonCount
      const data = rows.map((user) => {
        const plainUser = user.toJSON();
        return {
          ...plainUser,
          quizCount: plainUser.quizRecords?.length ?? 0,
          lessonCount: plainUser.lessons?.length ?? 0,
        };
      });

      return {
        data,
        meta: {
          total: count,
          limit: safeLimit,
          offset: safeOffset,
          currentCount: rows.length,
          hasNext: safeOffset + safeLimit < count,
          hasPrevious: safeOffset > 0,
        },
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching users',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async findOneByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { username },
      include: [{ association: 'goals' }, { association: 'subjects' }],
    });
    if (!user) {
      throw new NotFoundException(`User with username '${username}' not found`);
    }
    return user;
  }

  async findOneByUsernameMiddleware(username: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { username },
      attributes: { exclude: ['password'] },
      include: [{ association: 'goals' }, { association: 'subjects' }],
    });
    if (!user) {
      throw new NotFoundException(`User with username '${username}' not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { email: { [Op.iLike]: email } },
      attributes: { exclude: ['password'] },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { username },
      attributes: { exclude: ['password'] },
    });
  }

  async findByPersonalReferral(personalReferral: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { personal_referral: { [Op.iLike]: personalReferral } },
      attributes: { exclude: ['password'] },
    });
  }

  private async resolveReferrer(
    referralIdentifier: string,
  ): Promise<User | null> {
    const normalized = referralIdentifier.trim();
    if (!normalized) {
      return null;
    }

    const byPersonalReferral = await this.findByPersonalReferral(normalized);
    if (byPersonalReferral) {
      return byPersonalReferral;
    }

    return this.userModel.findOne({
      where: { username: { [Op.iLike]: normalized } },
      attributes: { exclude: ['password'] },
    });
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { email: { [Op.iLike]: email } },
      attributes: { exclude: ['password'] },
      include: [{ association: 'goals' }, { association: 'subjects' }],
    });
    if (!user) {
      throw new NotFoundException(`User with email '${email}' not found`);
    }
    return user;
  }

  async findOneByEmailReg(email: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { email: { [Op.iLike]: email } },
      attributes: { exclude: ['password'] },
      include: [{ association: 'goals' }, { association: 'subjects' }],
    });
    if (!user) {
      return null;
    }
    return user;
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{ association: 'goals' }, { association: 'subjects' }],
    });
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }
    return user;
  }

  async findAllByReferralUsername(referralUsername: string) {
    const identifier = referralUsername?.trim();
    if (!identifier) {
      return [];
    }

    const referrer = await this.userModel.findOne({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: identifier } },
          { personal_referral: { [Op.iLike]: identifier } },
        ],
      },
      attributes: ['username', 'personal_referral'],
    });

    const possibleReferralValues = new Set<string>([identifier]);
    if (referrer?.username) {
      possibleReferralValues.add(referrer.username);
    }
    if (referrer?.personal_referral) {
      possibleReferralValues.add(referrer.personal_referral);
    }

    const where = {
      [Op.or]: Array.from(possibleReferralValues).map((value) => ({
        referral: { [Op.iLike]: value },
      })),
    } as any;

    const user = await this.userModel.findAll({
      order: [['createdAt', 'DESC']],
      where,
      attributes: { exclude: ['password'] },
      include: [{ association: 'goals' }, { association: 'subjects' }],
    });
    if (!user || user.length === 0) {
      return [];
    }
    return user;
  }

  generateEmailVerificationToken(userId: string): string {
    const secretKey =
      process.env.EMAIL_VERIFICATION_SECRET || 'default-reset-password-secret';
    return jwt.sign({ sub: userId }, secretKey, { expiresIn: '1h' });
  }

  private generatePassword(length = 10): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    return password;
  }

  async getMyStreakAndCurrentWeekGrowth(userId: string): Promise<{
    streak_count: number;
    lessons_learnt: number;
    quizzes_done: number;
    mock_exams_done: number;
  }> {
    const sequelize = this.userModel.sequelize as any;

    type StreakRow = { current_streak: number };
    const [streakRows] = (await sequelize.query(
      `
        SELECT "currentStreak"::int AS current_streak
        FROM "user_streaks"
        WHERE "userId" = :userId
        LIMIT 1;
      `,
      { replacements: { userId } },
    )) as unknown as [StreakRow[], unknown];

    const streak_count = Number(streakRows?.[0]?.current_streak) || 0;

    type GrowthRow = {
      lessons_learnt: number;
      quizzes_done: number;
      mock_exams_done: number;
    };
    const [growthRows] = (await sequelize.query(
      `
        WITH bounds AS (
          SELECT
            date_trunc('week', now()) AS week_start_ts,
            date_trunc('week', now()) + interval '7 days' AS week_end_ts,
            date_trunc('week', now())::date AS week_start_date
        )
        SELECT
          (
            SELECT COUNT(*)::int
            FROM "lesson_trackings" lt, bounds b
            WHERE lt."userId" = :userId
              AND lt."dateCompleted" IS NOT NULL
              AND lt."dateCompleted" >= b.week_start_ts
              AND lt."dateCompleted" < b.week_end_ts
          ) AS lessons_learnt,
          (
            SELECT COUNT(*)::int
            FROM "quiz_records" qr, bounds b
            WHERE qr."userId" = :userId
              AND (
                (qr."weekStart" IS NOT NULL AND qr."weekStart"::date = b.week_start_date)
                OR
                (qr."weekStart" IS NULL AND qr."createdAt" >= b.week_start_ts AND qr."createdAt" < b.week_end_ts)
              )
          ) AS quizzes_done,
          (
            SELECT COUNT(*)::int
            FROM "mock_exam_records" mr, bounds b
            WHERE mr."userId" = :userId
              AND (
                (mr."weekStart" IS NOT NULL AND mr."weekStart"::date = b.week_start_date)
                OR
                (mr."weekStart" IS NULL AND mr."createdAt" >= b.week_start_ts AND mr."createdAt" < b.week_end_ts)
              )
          ) AS mock_exams_done;
      `,
      { replacements: { userId } },
    )) as unknown as [GrowthRow[], unknown];

    const row: GrowthRow | undefined = growthRows?.[0];

    return {
      streak_count,
      lessons_learnt: Number(row?.lessons_learnt) || 0,
      quizzes_done: Number(row?.quizzes_done) || 0,
      mock_exams_done: Number(row?.mock_exams_done) || 0,
    };
  }

  async getMyReferredPlayers(params?: {
    userId: string;
    offset?: number;
    limit?: number;
  }): Promise<{
    data: {
      id: string;
      joinDate: Date;
      name: string;
      image: string | null;
      totalXp: number;
    }[];
    meta: {
      total: number;
      offset: number;
      limit: number;
      currentCount: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }> {
    const { userId, offset = 0, limit = 10 } = params || ({} as any);
    const safeLimit = Math.min(Math.max(limit, 1), this.MAX_LIMIT);
    const safeOffset = Math.max(offset, 0);

    const owner = await this.userModel.findByPk(userId, {
      attributes: ['id', 'username', 'personal_referral'],
    });
    if (!owner) {
      throw new NotFoundException('User not found');
    }

    const referralToken =
      typeof owner.personal_referral === 'string'
        ? owner.personal_referral.trim()
        : '';

    if (!referralToken) {
      return {
        data: [],
        meta: {
          total: 0,
          offset: safeOffset,
          limit: safeLimit,
          currentCount: 0,
          hasNext: false,
          hasPrevious: false,
        },
      };
    }

    const where = { referral: { [Op.iLike]: referralToken } } as any;

    const { rows, count } = await this.userModel.findAndCountAll({
      where,
      attributes: [
        'id',
        'username',
        'fullName',
        'avatar',
        'systemAvatar',
        'createdAt',
      ],
      order: [['createdAt', 'DESC']],
      limit: safeLimit,
      offset: safeOffset,
    });

    const referredUserIds = rows.map((u) => u.id);
    const xpRecords = referredUserIds.length
      ? await this.xpRecordsModel.findAll({
          where: { userId: { [Op.in]: referredUserIds } },
          attributes: ['userId', 'currentXpValue'],
          raw: true,
        })
      : [];

    const xpByUserId = new Map<string, number>();
    for (const record of xpRecords as any[]) {
      xpByUserId.set(String(record.userId), Number(record.currentXpValue) || 0);
    }

    const data = rows.map((u) => ({
      id: u.id,
      joinDate: (u as any).createdAt,
      name: (u as any).fullName || (u as any).username,
      image: (u as any).avatar || (u as any).systemAvatar || null,
      totalXp: xpByUserId.get(u.id) ?? 0,
    }));

    const currentCount = data.length;
    const hasNext = safeOffset + safeLimit < count;
    const hasPrevious = safeOffset > 0;

    return {
      data,
      meta: {
        total: count,
        offset: safeOffset,
        limit: safeLimit,
        currentCount,
        hasNext,
        hasPrevious,
      },
    };
  }

  // async backfillPersonalReferralCodes(): Promise<{
  //   missingBefore: number;
  //   updated: number;
  //   missingAfter: number;
  // }> {
  //   const missingWhere = {
  //     [Op.or]: [{ personal_referral: null }, { personal_referral: '' }],
  //   } as any;

  //   const missingBefore = await this.userModel.count({ where: missingWhere });

  //   const [, metadata] = (await this.userModel.sequelize.query(
  //     `
  //       UPDATE "users"
  //       SET "personal_referral" = upper(substr(replace("id"::text, '-', ''), 1, 16))
  //       WHERE "personal_referral" IS NULL OR "personal_referral" = '';
  //     `,
  //   )) as any;

  //   const updated =
  //     Number(metadata?.rowCount) ||
  //     Number(metadata?.affectedRows) ||
  //     Number(metadata) ||
  //     0;

  //   const missingAfter = await this.userModel.count({ where: missingWhere });

  //   return { missingBefore, updated, missingAfter };
  // }

  async create(
    createUserDto: CreateUserDto,
    avatar?: Express.Multer.File,
    x = null,
    options?: { sendVerificationEmail?: boolean },
  ): Promise<User> {
    const normalizedEmail = createUserDto.email?.trim().toLowerCase();
    const { stateId, referral, ...rest } = createUserDto;
    const existingUser = await this.userModel.findOne({
      where: { email: { [Op.iLike]: normalizedEmail } },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already taken');
    }

    const referralIdentifier =
      typeof referral === 'string' ? referral.trim() : '';
    let referredBy: string | undefined;
    if (referralIdentifier) {
      const referrer = await this.resolveReferrer(referralIdentifier);
      if (!referrer) {
        throw new BadRequestException('Invalid referral');
      }
      referredBy = referrer.personal_referral || referrer.username;
    }

    // Generate a unique username from the email prefix
    const emailPrefix = normalizedEmail.split('@')[0];
    let username = createUserDto.username || emailPrefix;
    let count = 1;
    while (await this.userModel.findOne({ where: { username } })) {
      username = `${emailPrefix}${count}`;
      count++;
    }

    // ✅ Step 1: Use default random password if none is provided
    if (!createUserDto.password || createUserDto.password.trim() === '') {
      createUserDto.password = this.generatePassword(10);
    }

    // ✅ Step 2: Hash the password
    //  createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

    // Hash the password before saving
    const hashedPassword = await this.hashPassword(createUserDto.password);

    let avatarUrl: string | null = null;

    if (avatar) {
      avatarUrl = await this.bunnyService.upload(
        avatar.buffer,
        avatar.originalname,
      );
    }

    // Create and save the user
    try {
      let newUser: void | User;
      const payload = {
        ...rest,
        email: normalizedEmail,
        username,
        password: hashedPassword,
        ...(referredBy && { referral: referredBy }),
        ...(avatarUrl && { avatar: avatarUrl }),
        ...(createUserDto.systemAvatar && {
          systemAvatar: createUserDto.systemAvatar,
        }),
      } as any;

      // Only include stateId if it is provided
      if (stateId) {
        payload.stateId = stateId;
      }

      if (x !== null) {
        newUser = await this.userModel.create(payload, x);
      } else {
        newUser = await this.userModel.create(payload);
      }

      if (newUser) {
        if (options?.sendVerificationEmail !== false) {
          const verificationToken = this.generateEmailVerificationToken(
            newUser.id,
          );
          /*
if (newUser.referral) {
const upline: User = await this.findOneByUsername(newUser.referral);
const xpConfig: XpConfiguration = await this.xpLogService.getXpConfig();
await this.xpLogService.create({
userId: upline?.id,
xpValue: xpConfig.xpValuePerReferral,
xpType: "referral",
detail: `xp bonus for referring ${newUser.username}`,
});
}
*/
          await this.emailService.sendVerificationEmail({
            userEmail: normalizedEmail,
            link: `${process.env.FRONTEND_URL}/activate?token=${verificationToken}`,
          });
        }
      }
      return newUser ? newUser : null;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating the user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async update(
    id: string,
    updatedUserDto: UpdateUserDto,
    userId: string,
    avatar?: Express.Multer.File,
  ): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    const adminCheck = await this.userModel.findOne({ where: { id: userId } });

    if (
      !(
        user.id === userId || ['ADMIN', 'SUPER_ADMIN'].includes(adminCheck.role)
      )
    ) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }

    const updatedUserData: any = { ...updatedUserDto };

    // Prevent assigning SUPER_ADMIN
    if (updatedUserDto.role === RoleEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        'Cannot assign SUPER_ADMIN role during registration or update',
      );
    }

    // Explicitly remove role if present
    if ('role' in updatedUserData) {
      delete updatedUserData.role;
    }

    // Remove stateId if not provided
    if (!updatedUserDto.stateId) {
      delete updatedUserData.stateId;
    }

    if (updatedUserDto.systemAvatar) {
      updatedUserData.systemAvatar = updatedUserDto.systemAvatar;
    }

    // HANDLE AVATAR
    if (avatar) {
      const avatarUrl = await this.bunnyService.upload(
        avatar.buffer,
        avatar.originalname,
      );

      updatedUserData.avatar = avatarUrl;
    }

    try {
      await user.update(updatedUserData);
      return await this.findOneById(id);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating the user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findOneByEmailForAuth(email: string): Promise<User | null> {
    const normalizedEmail = email.trim();
    return this.userModel.findOne({
      where: { email: { [Op.iLike]: normalizedEmail } },
    });
  }

  async linkSubjectsAndGoals(
    userId: string,
    subjectIds?: string[],
    goalIds?: string[],
  ): Promise<User> {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    if (subjectIds) {
      const subjects = await Subject.findAll({ where: { id: subjectIds } });
      if (subjects.length !== subjectIds.length) {
        const existingIds = new Set(subjects.map((s) => s.id));
        const missing = subjectIds.filter((id) => !existingIds.has(id));
        throw new BadRequestException(
          `Invalid subjectIds: ${missing.join(', ')}`,
        );
      }
      await (user as any).$set('subjects', subjectIds);
    }

    if (goalIds) {
      const goals = await Goal.findAll({ where: { id: goalIds } });
      if (goals.length !== goalIds.length) {
        const existingIds = new Set(goals.map((g) => g.id));
        const missing = goalIds.filter((id) => !existingIds.has(id));
        throw new BadRequestException(`Invalid goalIds: ${missing.join(', ')}`);
      }
      await (user as any).$set('goals', goalIds);
    }

    return this.findOneById(userId);
  }

  async delete(id: string): Promise<User> {
    const userToRemove = await this.findOneById(id);
    if (!userToRemove) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    try {
      await userToRemove.destroy();
      return userToRemove;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting the user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async getAdminWebPreferences(userId: string): Promise<AdminWebPreferences> {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    const raw = (user as any).adminWebPreferences as
      | Partial<AdminWebPreferences>
      | undefined;

    return {
      theme_mode: raw?.theme_mode ?? 'light',
      font_size: raw?.font_size ?? 'medium',
      remember_me: raw?.remember_me ?? false,
    };
  }

  async updateAdminWebPreferences(
    userId: string,
    preferences: AdminWebPreferences,
  ): Promise<AdminWebPreferences> {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    try {
      await user.update({
        adminWebPreferences: preferences,
      } as any);
      return await this.getAdminWebPreferences(userId);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating admin web preferences',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async getPopularFeatures(params?: { offset?: number; limit?: number }) {
    const offset = Math.max(params?.offset ?? 0, 0);
    const limit = Math.min(params?.limit ?? 10, 500);

    const sequelize = this.userModel.sequelize as any;

    const baseCte = `
      WITH combined AS (
        SELECT
          l.id::text AS id,
          l.title AS title,
          l.subtitle AS subtitle,
          l.description AS description,
          l."avatarOrCover" AS image,
          l."subjectId"::text AS "subjectId",
          s.title AS "subjectTitle",
          CASE
            WHEN EXISTS (
              SELECT 1
              FROM "lesson_topics" t
              WHERE t."lessonId" = l.id AND t."topicType" = 'VIDEO'
            )
            THEN 'VIDEO_LESSON'
            ELSE 'TEXT_LESSON'
          END AS category,
          COALESCE((
            SELECT COUNT(DISTINCT lt."userId")
            FROM "lesson_trackings" lt
            WHERE lt."lessonId" = l.id
          ), 0)::int AS popularity,
          l."createdAt" AS created_at
        FROM "lessons" l
        JOIN "subjects" s ON s.id = l."subjectId"
        WHERE l.status = 'APPROVED'

        UNION ALL

        SELECT
          q.id::text AS id,
          q.title AS title,
          NULL::text AS subtitle,
          q.description AS description,
          q.avatar AS image,
          q."subjectId"::text AS "subjectId",
          s.title AS "subjectTitle",
          'QUIZ' AS category,
          COALESCE((
            SELECT COUNT(DISTINCT qr."userId")
            FROM "quiz_records" qr
            WHERE qr."quizId" = q.id
          ), 0)::int AS popularity,
          q."createdAt" AS created_at
        FROM "quizzes" q
        JOIN "subjects" s ON s.id = q."subjectId"
        WHERE q.status = 'APPROVED'

        UNION ALL

        SELECT
          m.id::text AS id,
          m.title AS title,
          NULL::text AS subtitle,
          m.description AS description,
          m.avatar AS image,
          m."subjectId"::text AS "subjectId",
          s.title AS "subjectTitle",
          'MOCK_EXAM' AS category,
          COALESCE((
            SELECT COUNT(DISTINCT mr."userId")
            FROM "mock_exam_records" mr
            WHERE mr."mockExamId" = m.id
          ), 0)::int AS popularity,
          m."createdAt" AS created_at
        FROM "mock_exams" m
        JOIN "subjects" s ON s.id = m."subjectId"
        WHERE m.status = 'APPROVED'
      )
    `;

    const [countRows] = (await sequelize.query(
      `
        ${baseCte}
        SELECT COUNT(*)::int AS total
        FROM combined;
      `,
    )) as unknown as [{ total: number }[], unknown];

    const total = Number(countRows?.[0]?.total) || 0;

    const [rows] = (await sequelize.query(
      `
        ${baseCte}
        SELECT
          id,
          title,
          subtitle,
          description,
          image,
          "subjectId",
          "subjectTitle",
          category,
          popularity
        FROM combined
        ORDER BY popularity DESC, created_at DESC
        LIMIT :limit OFFSET :offset;
      `,
      { replacements: { limit, offset } },
    )) as unknown as [any[], unknown];

    const data = (rows || []).map((r) => ({
      ...r,
      popularity: Number(r.popularity) || 0,
    }));

    return {
      data,
      meta: {
        totalItems: total,
        limit,
        offset,
        currentCount: data.length,
        hasNext: offset + limit < total,
        hasPrevious: offset > 0,
      },
    };
  }
}
