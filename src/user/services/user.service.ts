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
import { User } from '../models/user.model';
import * as jwt from 'jsonwebtoken';
import { Op, WhereOptions } from 'sequelize';
import { UserSearchDto } from '../dto/user-search.dto';
import { MailService } from '../../email/email.service';
import { UserStatusEnum } from '../../shared-types/UserStatusEnum';
import { RoleEnum } from '../../shared-types/RoleEnum';
import stringify from 'safe-stable-stringify';
import { XpLogService } from 'src/xp/services/xp-log.service';
import { XpConfiguration } from 'src/xp/models/xp-configuration.model';
import { Express } from 'express';
import { BunnyService } from 'src/common/services/bunny.service';

@Injectable()
export class UserService {
  private readonly MAX_LIMIT = 100; // optional max cap for pagination

  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
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
      { where: { email: email } },
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

  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
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
      include: [{ association: 'goals' }, { association: 'subjects' }],
    });
    if (!user) {
      throw new NotFoundException(`User with username '${username}' not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ where: { username } });
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { email },
      include: [{ association: 'goals' }, { association: 'subjects' }],
    });
    if (!user) {
      throw new NotFoundException(`User with email '${email}' not found`);
    }
    return user;
  }

  async findOneByEmailReg(email: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { email },
      include: [{ association: 'goals' }, { association: 'subjects' }],
    });
    if (!user) {
      return null;
    }
    return user;
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      include: [{ association: 'goals' }, { association: 'subjects' }],
    });
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }
    return user;
  }

  async findAllByReferralUsername(referralUsername: string) {
    const user = await this.userModel.findAll({
      order: [['createdAt', 'DESC']],
      where: { referral: referralUsername },
      include: [{ association: 'goals' }, { association: 'subjects' }],
    });
    if (!user || user.length === 0) {
      return [];
    }
    return user;
  }

  async generateEmailVerificationToken(userId: string): Promise<string> {
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

  async create(
    createUserDto: CreateUserDto,
    avatar?: Express.Multer.File,
    x = null,
    options?: { sendVerificationEmail?: boolean },
  ): Promise<User> {
    const { email, password, stateId, ...rest } = createUserDto;
    const existingUser = await this.userModel.findOne({ where: { email } });

    if (existingUser) {
      throw new BadRequestException('Email is already taken');
    }

    // Generate a unique username from the email prefix
    let username = createUserDto.username || email.split('@')[0];
    let count = 1;
    while (await this.userModel.findOne({ where: { username } })) {
      username = `${email.split('@')[0]}${count}`;
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
        email,
        username,
        password: hashedPassword,
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
          const verificationToken = await this.generateEmailVerificationToken(
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
            userEmail: email,
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
}
