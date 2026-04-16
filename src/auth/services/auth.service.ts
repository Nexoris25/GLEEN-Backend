import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as jwt from 'jsonwebtoken';
import { User } from '../../user/models/user.model';
import { UpdateUserDto } from '../../user/dto/update-user.dto';
import { UserService } from '../../user/services/user.service';
import * as dotenv from 'dotenv';
//import dotenv from 'dotenv';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { MailService } from '../../email/email.service';
import { OAuth2Client } from 'google-auth-library';
//import * as jwksClient from 'jwks-rsa';
import jwksClient from 'jwks-rsa';
import { BunnyService } from 'src/common/services/bunny.service';

import sharp from 'sharp';
import { Op } from 'sequelize';
import { PasswordResetOtp } from '../models/password-reset-otp.model';
import { EmailVerificationOtp } from '../models/email-verification-otp.model';
import { InjectModel } from '@nestjs/sequelize';
import { RoleEnum } from 'src/shared-types/RoleEnum';

dotenv.config();

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  constructor(
    private readonly userService: UserService,
    private readonly emailService: MailService,
    private readonly bunnyService: BunnyService,
    @InjectModel(EmailVerificationOtp)
    private readonly emailVerificationOtpModel: typeof EmailVerificationOtp,
    @InjectModel(PasswordResetOtp)
    private readonly passwordResetOtpModel: typeof PasswordResetOtp,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isPasswordValid = await this.userService.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    return user;
  }

  async validateIsAdmin(userId: string): Promise<boolean> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new UnauthorizedException('Admin validation user not found');
    }
    return ['SUPER_ADMIN', 'ADMIN'].includes(user.role);
  }

  validateUserById(id: string): Promise<User> {
    return this.userService.findOneById(id);
  }

  validateUserByUsername(username: string): Promise<User> {
    return this.userService.findOneByUsername(username);
  }

  validateUserByUsernameMiddleware(Username: string): Promise<User> {
    return this.userService.findOneByUsernameMiddleware(Username);
  }

  generateTwoFactorSecret(): string {
    const secret = speakeasy.generateSecret({ length: 20 });
    return secret.otpauth_url;
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{
    user: User;
    token: string;
    expiresIn: number;
  }> {
    const user = await this.validateUser(email, password);

    if (!user.isEmailVerified) {
      throw new BadRequestException('Email address not verified yet.');
    }

    const token = this.generateJwtToken(user);
    return { user, token, expiresIn: this.getJwtExpUnix(token) };
  }

  /**
   * Register a new user with optional avatar upload
   * @param createUserDto
   * @param avatarFile optional Express.Multer.File
   */

  async register(
    createUserDto: CreateUserDto,
    avatarFile?: Express.Multer.File,
  ): Promise<User> {
    try {
      let avatarUrl: string | undefined;

      // 1. Handle avatar upload
      if (avatarFile) {
        if (!avatarFile.buffer || avatarFile.buffer.length === 0) {
          throw new BadRequestException('Invalid or empty avatar file');
        }

        const resizedBuffer = await sharp(avatarFile.buffer)
          .resize(256, 256)
          .png()
          .toBuffer();

        const safeFileName = `avatar_${Date.now()}.png`;
        avatarUrl = await this.bunnyService.upload(resizedBuffer, safeFileName);

        if (!avatarUrl) {
          throw new Error('Avatar upload returned empty URL');
        }

        createUserDto.avatar = avatarUrl;
      }

      // 2. Optional: explicit pre-check for common conflicts
      const existing = await this.userService.findByEmail(createUserDto.email);
      if (existing) {
        throw new BadRequestException('Email already in use');
      }

      if (createUserDto.username) {
        const existingUsername = await this.userService.findByUsername(
          createUserDto.username,
        );

        if (existingUsername) {
          throw new BadRequestException('Username already taken');
        }
      }

      if (
        createUserDto.role === RoleEnum.SUPER_ADMIN ||
        createUserDto.role === RoleEnum.ADMIN
      ) {
        throw new BadRequestException(
          'Cannot assign ADMIN/SUPER_ADMIN role during registration',
        );
      }

      /*
    // Username check (if username is required/unique)
    if (createUserDto.username) {
      const existingUsername = await this.userService.findOneByUsername(createUserDto.username);
      if (existingUsername) {
        throw new BadRequestException('Username already taken');
      }
    }
*/

      // 3. Create user
      const user = await this.userService.create(createUserDto);

      return user;
    } catch (err: any) {
      // ── Rich logging
      console.error('[AuthService.register] Registration failed', {
        email: createUserDto.email,
        username: createUserDto.username,
        hasAvatar: !!avatarFile,
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack,
        originalError: err.original?.message || err.original, // for Sequelize
      });

      // Better classification
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw new BadRequestException('Email or username already exists');
      }

      if (err.name === 'SequelizeValidationError') {
        const messages = err.errors?.map((e: any) => e.message) || [
          err.message,
        ];
        throw new BadRequestException(
          `Validation failed: ${messages.join(', ')}`,
        );
      }

      if (err instanceof BadRequestException) {
        throw err; // re-throw if already proper
      }

      // Fallback for everything else
      throw new BadRequestException({
        message: 'Failed to register user',
        reason: err.message || 'Unknown error',
      });
    }
  }

  async verifyEmail(token: string): Promise<{
    user: User;
    token: string;
    expiresIn: number;
  }> {
    try {
      const decodedToken: any = jwt.verify(
        token,
        process.env.EMAIL_VERIFICATION_SECRET,
      );
      const userId = decodedToken.sub;
      await this.userService.verifyEmail(userId);
      const user = await this.userService.findOneById(userId);
      const jwtToken = this.generateJwtToken(user);
      return { user, token: jwtToken, expiresIn: this.getJwtExpUnix(jwtToken) };
    } catch {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async sendResetPasswordEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.emailService.sendForgotPasswordEmail({
      userEmail: email,
      userName: user.username,
      link: resetPasswordLink,
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const resetToken = this.generateResetPasswordToken(user.id);
    await this.sendResetPasswordEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decodedToken: any = jwt.verify(
        token,
        process.env.RESET_PASSWORD_SECRET,
      );

      if (decodedToken.exp && Date.now() >= decodedToken.exp * 1000) {
        throw new BadRequestException('Reset password token has expired');
      }

      const userId = decodedToken.sub;
      await this.userService.updatePassword(userId, newPassword);
    } catch {
      throw new BadRequestException('Invalid or expired reset password token');
    }
  }
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const userRetrieve = await this.userService.findOneById(userId);
    if (!userRetrieve) {
      throw new NotFoundException('User not found');
    }

    const isValid = await this.validateUser(userRetrieve.email, oldPassword);
    if (!isValid) {
      throw new BadRequestException('Invalid or incorrect old password');
    }

    await this.userService.updatePassword(userId, newPassword);
  }

  private generateJwtToken(user: User): string {
    const payload = { username: user.username, sub: user.id, role: user.role };
    const secretKey = process.env.JWT_SECRET_KEY || 'default-secret-key';
    return jwt.sign(payload, secretKey, {
      expiresIn: process.env.JWT_EXPIRATION_TIME || '30d',
    });
  }

  private async generateUniqueUsernameFromEmail(
    email: string,
  ): Promise<string> {
    const base = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 20);

    const safeBase = base || 'user';
    const candidates = [
      safeBase,
      `${safeBase}_${Math.random().toString(36).slice(2, 6)}`,
      `${safeBase}_${Math.random().toString(36).slice(2, 8)}`,
      `${safeBase}_${Date.now().toString(36).slice(-6)}`,
    ];

    for (const username of candidates) {
      const exists = await this.userService.findByUsername(username);
      if (!exists) return username;
    }

    for (let i = 0; i < 10; i++) {
      const username = `${safeBase}_${Math.random().toString(36).slice(2, 10)}`;
      const exists = await this.userService.findByUsername(username);
      if (!exists) return username;
    }

    throw new BadRequestException('Unable to generate a unique username');
  }

  private getJwtExpUnix(token: string): number {
    const decoded = jwt.decode(token) as jwt.JwtPayload | null;
    const expUnix = typeof decoded?.exp === 'number' ? decoded.exp : 0;
    return expUnix;
  }

  private generateResetPasswordToken(userId: string): string {
    const secretKey =
      process.env.RESET_PASSWORD_SECRET || 'default-reset-password-secret';
    return jwt.sign({ sub: userId }, secretKey, {
      expiresIn: process.env.JWT_EXPIRATION_TIME || '1h',
    });
  }

  generateEmailVerificationToken(userId: string): string {
    const secretKey =
      process.env.EMAIL_VERIFICATION_SECRET || 'default-reset-password-secret';
    return jwt.sign({ sub: userId }, secretKey, { expiresIn: '1h' });
  }

  async updateProfile(
    id: string,
    updateUserDto: UpdateUserDto,
    userId: string,
  ): Promise<User> {
    const existingUser = await this.userService.findOneById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const data = Object.assign(existingUser, updateUserDto);
    const updateUserData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );
    return this.userService.update(id, updateUserData as any, userId);
  }

  async registerLite(dto: {
    email: string;
    password: string;
    referral?: string;
    role: RoleEnum;
  }): Promise<User> {
    const username = await this.generateUniqueUsernameFromEmail(dto.email);
    return this.userService.create(
      {
        email: dto.email,
        password: dto.password,
        referral: dto.referral,
        role: dto.role,
        username,
      } as any,
      undefined,
      null,
      { sendVerificationEmail: false },
    );
  }

  verifyTwoFactorToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
  }

  async loginWithGoogle(
    idToken: string,
  ): Promise<{ user: User; token: string; expiresIn: number }> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new BadRequestException('Invalid Google token');
    }

    const email = payload.email;
    let user = await this.userService.findOneByEmail(email);

    const timestamp = Date.now().toString(36);
    const uniqueId = `autogen-${timestamp}`;

    if (!user) {
      user = await this.userService.create({
        username: payload.name || email.split('@')[0],
        email,
        provider: 'google',
        providerId: payload.sub, // Google user ID
        avatar: payload.picture,
        password: uniqueId,
        firstName:
          payload.given_name ||
          (payload.name ? payload.name.split(' ')[0] : email.split('@')[0]),
        lastName:
          payload.family_name ||
          (payload.name
            ? payload.name.split(' ').slice(1).join(' ')
            : 'update'),
        isEmailVerified: true,
      } as any);
    }

    const token = this.generateJwtToken(user);
    return { user, token, expiresIn: this.getJwtExpUnix(token) };
  }

  async loginWithApple(
    idToken: string,
    userName?: { firstName?: string; lastName?: string },
  ): Promise<{
    user: User;
    token: string;
    expiresIn: number;
  }> {
    const client = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });

    function getKey(header, callback) {
      client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err, null);
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      });
    }

    const decoded: any = await new Promise((resolve, reject) => {
      jwt.verify(idToken, getKey, { algorithms: ['RS256'] }, (err, decoded) =>
        err ? reject(err) : resolve(decoded),
      );
    });

    const email = decoded.email;
    if (!email) {
      throw new BadRequestException('Apple ID token does not contain email');
    }

    let user = await this.userService.findOneByEmail(email);

    const timestamp = Date.now().toString(36);
    const uniqueId = `autogen-${timestamp}`;

    if (!user) {
      user = await this.userService.create({
        username: email.split('@')[0],
        email,
        provider: 'apple',
        providerId: decoded.sub,
        avatar: '',
        password: uniqueId,
        firstName: userName?.firstName || email.split('@')[0],
        lastName: userName?.lastName || 'update',
        isEmailVerified: true,
      } as any);
    }

    const token = this.generateJwtToken(user);
    return { user, token, expiresIn: this.getJwtExpUnix(token) };
  }

  /**
   * Generates a 6-digit OTP for email verification, saves it to a new table, and returns the OTP.
   * Uses email instead of userId.
   */
  async generateEmailVerificationOtp(email: string): Promise<string> {
    // Generate a 6-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Set expiry time (e.g., 10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to a new table (assumes EmailVerificationOtp model exists)
    await this.emailVerificationOtpModel.create({
      email,
      otp,
      expiresAt,
      verified: false,
    });

    await this.emailService.sendEmailVerificationOtp({
      userEmail: email,
      otp,
    });

    return otp;
  }

  /**
   * Verifies the OTP for email verification.
   * Marks the OTP as used and sets the user's email as verified if successful.
   */
  async verifyEmailOtp(
    email: string,
    otp: string,
  ): Promise<{ token: string; expiresIn: number }> {
    // Find OTP record
    const otpRecord = await this.emailVerificationOtpModel.findOne({
      where: {
        email,
        otp,
        verified: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await otpRecord.update({ verified: true });
    await this.userService.verifyEmailV1(email);
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = this.generateJwtToken(user);
    return { token, expiresIn: this.getJwtExpUnix(token) };
  }

  /**
   * Generates a 6-digit OTP for password reset, saves it to a new table, and returns the OTP.
   * Uses email as the identifier.
   */
  async generatePasswordResetOtp(email: string): Promise<string> {
    // Generate a 6-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Set expiry time (e.g., 10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to a new table (assumes PasswordResetOtp model exists)
    await this.passwordResetOtpModel.create({
      email,
      otp,
      expiresAt,
      used: false,
    });

    await this.emailService.sendPasswordResetOtp({
      userEmail: email,
      otp,
    });

    return otp;
  }

  /**
   * Verifies the OTP for password reset.
   * Marks the OTP as used and allows password reset if successful.
   */

  async verifyPasswordResetOtp(email: string, otp: string): Promise<boolean> {
    // Find OTP record
    const otpRecord = await this.passwordResetOtpModel.findOne({
      where: {
        email,
        otp,
        used: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    // await otpRecord.update({ used: true });

    return true;
  }

  async verifyPasswordResetOtpV1(email: string, otp: string): Promise<boolean> {
    // Find OTP record
    const otpRecord = await this.passwordResetOtpModel.findOne({
      where: {
        email,
        otp,
        used: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await otpRecord.update({ used: true });

    return true;
  }

  /**
   * Resets the user's password using a valid OTP.
   */
  async resetPasswordWithOtpVerify(
    email: string,
    otp: string,
  ): Promise<{ success: boolean; message: string }> {
    // Verify OTP
    await this.verifyPasswordResetOtp(email, otp);

    return {
      success: true,
      message: 'OTP verified successfully. You may now reset your password.',
    };
  }

  async resetPasswordWithOtp(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<void> {
    // Verify OTP
    await this.verifyPasswordResetOtp(email, otp);
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user's password
    await this.userService.updatePassword(user.id, newPassword);
  }
}
