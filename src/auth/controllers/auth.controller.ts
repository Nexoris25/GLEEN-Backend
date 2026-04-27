import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpStatus,
  UseGuards,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { State } from 'src/states/models/state.model';
import { InjectModel } from '@nestjs/sequelize';
import { AuthService } from '../services/auth.service';
import {
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { LoginUserDto } from '../dto/login-user.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ResetPasswordValidateDto } from '../dto/reset-password-validate.dto';
import { User } from 'src/user/models/user.model';
import { GetUser } from 'src/shared-types/user.decorator';

import { NoGuard } from '../GuardsDecorMiddleware/no-protection.guard';
import { JwtAuthGuard } from '../GuardsDecorMiddleware/jwt-auth.guard';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserLoginResponse } from 'src/shared-types/UserLoginResponse';
import { UserService } from 'src/user/services/user.service';
import stringify from 'safe-stable-stringify';
import { ResponseDto, UserResponseDto } from 'src/shared-types/response.dto';
import { RegisterLiteDto } from '../dto/register-lite.dto';

import { UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    @InjectModel(State)
    private readonly stateModel: typeof State,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserLoginResponse,
    description: 'Login successful',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Login failed',
    type: ResponseDto,
  })
  @UseGuards(NoGuard)
  async login(@Body(new ValidationPipe()) loginUserDto: LoginUserDto): Promise<{
    status: number;
    message: string;
    data?: {
      user: User;
      token: string;
      expiresIn: number;
    };
    error?: any;
  }> {
    try {
      const userLogin = await this.authService.login(loginUserDto);
      return {
        status: HttpStatus.OK,
        message: 'Login successful',
        data: userLogin,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Login failed',
        error: stringify({
          message: (error as any)?.message,
          stack: (error as any)?.stack,
          details: (error as any)?.response || error,
        }),
      };
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiConsumes('multipart/form-data') // important for file upload
  @ApiBody({
    description: 'User registration data',
    type: CreateUserDto,
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        avatar: { type: 'string', format: 'binary' },
      },
      required: ['email', 'password'],
    },
  })
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Registration failed',
    type: ResponseDto,
  })
  async register(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ): Promise<{ status: number; message: string; data?: User; error?: any }> {
    // ----------------------------
    // Validate state exists
    // ----------------------------
    //const state = await this.stateModel.findByPk(createUserDto.stateId);
    //if (!state) {
    // throw new BadRequestException('Invalid stateId provided');
    //}

    if (createUserDto.username) {
      const existingUser = await this.userService
        .findOneByUsername(createUserDto.username)
        .catch(() => null);

      if (existingUser) {
        throw new BadRequestException('Username is already taken');
      }
    }
    const existingEmail = await this.userService
      .findOneByEmail(createUserDto.email)
      .catch(() => null);

    if (existingEmail) {
      throw new BadRequestException('Email is already taken');
    }

    try {
      // ✅ Validate stateId exists
      // if (!createUserDto.stateId) { throw new BadRequestException('stateId is required');  }

      // if (!stateExists) {
      //  throw new BadRequestException('Invalid stateId supplied'); }

      const user = await this.authService.register(createUserDto, avatar);

      return {
        status: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: user,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Registration failed',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('register-lite')
  @ApiOperation({
    summary: 'Register with email and password only',
    description:
      'Register a user by providing email, password, confirmPassword, optional referral, and role.',
  })
  @ApiBody({ type: RegisterLiteDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Registration failed',
    type: ResponseDto,
  })
  @UseGuards(NoGuard)
  async registerLite(
    @Body(new ValidationPipe()) dto: RegisterLiteDto,
  ): Promise<{ status: number; message: string; data?: any; error?: any }> {
    try {
      if (dto.password !== dto.confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      const user = await this.authService.registerLite({
        email: dto.email,
        password: dto.password,
        referral: dto.referral,
        role: dto.role,
      });

      await this.authService.generateEmailVerificationOtp(dto.email);

      return {
        status: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: user,
      };
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Registration failed',
        error: stringify({
          message: (error as Error)?.message || 'Unknown error',
          stack: (error as Error)?.stack,
          details: (error as { response?: unknown })?.response || error,
        }),
      };
    }
  }

  @Get('verify-email/:token')
  @ApiOperation({ summary: 'Verify user email with token' })
  @ApiParam({ name: 'token', description: 'Verification token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email verified successfully',
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invalid or expired verification token',
    type: ResponseDto,
  })
  @UseGuards(NoGuard)
  async verifyEmail(
    @Param('token') token: string,
  ): Promise<{ status: number; message: string; data?: any; error?: any }> {
    try {
      const data = await this.authService.verifyEmail(token);
      return {
        status: HttpStatus.OK,
        message: 'Email verified successfully',
        data,
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'Invalid or expired verification token',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset email sent successfully',
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error sending password reset email',
    type: ResponseDto,
  })
  @UseGuards(NoGuard)
  async requestPasswordReset(
    @Body(new ValidationPipe()) body: ResetPasswordDto,
  ): Promise<{ status: number; message: string; data?: any; error?: any }> {
    try {
      await this.authService.requestPasswordReset(body.email);
      return {
        status: HttpStatus.OK,
        message: 'Password reset email sent successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error sending password reset email',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change password for logged-in user' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error changing password',
    type: ResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  //@UseGuards(NoGuard)
  async changePassword(
    @GetUser() user: User,
    @Body(new ValidationPipe()) body: ChangePasswordDto,
  ): Promise<{ status: number; message: string; data?: any; error?: any }> {
    try {
      console.log(
        `'userId', ${user.id} OLD ${body.oldPassword} NEW ${body.newPassword}`,
      );
      await this.authService.changePassword(
        user.id,
        body.oldPassword,
        body.newPassword,
      );
      return {
        status: HttpStatus.OK,
        message: 'Password changed successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error changing password',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('reset-password/:token')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiParam({ name: 'token', description: 'Reset password token' })
  @ApiBody({ type: ResetPasswordValidateDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully',
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invalid or expired reset password token',
    type: ResponseDto,
  })
  @UseGuards(NoGuard)
  async resetPassword(
    @Param('token') token: string,
    @Body(new ValidationPipe()) body: ResetPasswordValidateDto,
  ): Promise<{ status: number; message: string; data?: any; error?: any }> {
    try {
      await this.authService.resetPassword(token, body.newPassword);
      return {
        status: HttpStatus.OK,
        message: 'Password reset successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'Invalid or expired reset password token',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('google/token')
  @ApiOperation({ summary: 'Login with Google ID token' })
  @ApiBody({ schema: { example: { idToken: 'google_id_token' } } })
  @ApiResponse({
    status: 200,
    description: 'Returns user + JWT token',
    type: UserLoginResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Could not login',
    type: ResponseDto,
  })
  async googleLogin(@Body('idToken') idToken: string) {
    try {
      const userLogin = await this.authService.loginWithGoogle(idToken);
      return {
        status: HttpStatus.OK,
        message: 'Login successful',
        data: userLogin,
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'could not login',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('apple/token')
  @ApiOperation({ summary: 'Login with Apple ID token' })
  @ApiBody({
    schema: {
      example: {
        idToken: 'apple_id_token',
        userName: { firstName: 'John', lastName: 'Doe' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns user + JWT token',
    type: UserLoginResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Could not login',
    type: ResponseDto,
  })
  async appleLogin(
    @Body('idToken') idToken: string,
    @Body('userName') userName?: { firstName?: string; lastName?: string },
  ) {
    try {
      const userLogin = await this.authService.loginWithApple(
        idToken,
        userName,
      );
      return {
        status: HttpStatus.OK,
        message: 'Login successful',
        data: userLogin,
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'could not login',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('email/verify/generate-otp')
  @ApiOperation({ summary: 'Generate OTP for email verification' })
  @ApiBody({ schema: { example: { email: 'user@example.com' } } })
  @ApiResponse({
    status: 200,
    description: 'OTP generated successfully',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ResponseDto,
  })
  async generateEmailVerificationOtp(@Body('email') email: string) {
    try {
      const otp = await this.authService.generateEmailVerificationOtp(email);
      return {
        status: HttpStatus.OK,
        message: 'OTP generated successfully',
        data: { otp },
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'User not found',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('email/verify/validate-otp')
  @ApiOperation({ summary: 'Validate OTP for email verification' })
  @ApiBody({
    schema: { example: { email: 'user@example.com', otp: '123456' } },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP validated successfully',
    type: UserLoginResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ResponseDto,
  })
  async validateEmailVerificationOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
  ) {
    try {
      const data = await this.authService.verifyEmailOtp(email, otp);
      return {
        status: HttpStatus.OK,
        message: 'OTP validated successfully',
        data,
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'User not found',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('password/reset/generate-otp')
  @ApiOperation({ summary: 'Generate OTP for password reset' })
  @ApiBody({ schema: { example: { email: 'user@example.com' } } })
  @ApiResponse({
    status: 200,
    description: 'OTP generated successfully',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ResponseDto,
  })
  async generatePasswordResetOtp(@Body('email') email: string) {
    try {
      const otp = await this.authService.generatePasswordResetOtp(email);
      return {
        status: HttpStatus.OK,
        message: 'OTP generated successfully',
        data: { otp },
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'User not found',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('password/reset/validate-otp')
  @ApiOperation({ summary: 'Validate OTP for password reset' })
  @ApiBody({
    schema: { example: { email: 'user@example.com', otp: '123456' } },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP validated successfully',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ResponseDto,
  })
  async validatePasswordResetOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
  ) {
    try {
      await this.authService.resetPasswordWithOtpVerify(email, otp);
      return {
        status: HttpStatus.OK,
        message: 'OTP validated successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'User not found',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('password/reset/update-password')
  @ApiOperation({ summary: 'Change password with verified otp' })
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
        otp: '123456',
        newPassword: 'newPassword123',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ResponseDto,
  })
  async updatePasswordResetOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string,
  ) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await this.authService.resetPasswordWithOtp(
        normalizedEmail,
        otp,
        newPassword,
      );
      return {
        status: HttpStatus.OK,
        message: 'Password changed successfully',
      };
    } catch (error) {
      const rawMessage =
        error?.response?.message ??
        error?.message ??
        'Failed to change password';
      const message = Array.isArray(rawMessage)
        ? rawMessage.join(', ')
        : String(rawMessage);

      const status = message.toLowerCase().includes('user not found')
        ? HttpStatus.NOT_FOUND
        : message.toLowerCase().includes('otp')
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;

      return {
        status,
        message,
        error: stringify({
          message,
          stack: error?.stack,
          details: error?.response || error,
        }),
      };
    }
  }
}
