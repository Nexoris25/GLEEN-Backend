import {
  Controller,
  Get,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
  ValidationPipe,
  HttpStatus,
  Query,
  Post,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { User } from '../models/user.model';
import { JwtAuthGuard } from '../../auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateMyProfileDto } from '../dto/update-my-profile.dto';
import {
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiOperation,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  ResponseDto,
  UserArrayResponseDto,
  UserResponseDto,
} from 'src/shared-types/response.dto';
import { UserSearchDto } from '../dto/user-search.dto';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import stringify from 'safe-stable-stringify';
// import { AdminOnly } from 'src/auth/GuardsDecorMiddleware/AdminOnlyDecorator.guard';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@ApiTags('User')
@UseGuards(JwtAuthGuard, RolesGuard) // Any authenticated user
@Controller('')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('user/profile')
  @ApiOperation({ summary: 'Update my profile' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        picUrl: { type: 'string' },
        name: { type: 'string' },
        gender: { type: 'string', example: 'MALE' },
        country: { type: 'string' },
        state: { type: 'string', format: 'uuid' },
        localGovernment: { type: 'string', format: 'uuid' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  async updateMyProfile(
    @Body(new ValidationPipe()) dto: UpdateMyProfileDto,
    @UserId() userId: string,
  ): Promise<{ status: number; message: string; data?: User; error?: any }> {
    try {
      const updateUserDto: UpdateUserDto = {};
      if (dto.name !== undefined) updateUserDto.fullName = dto.name;
      if (dto.gender !== undefined) updateUserDto.gender = dto.gender;
      if (dto.country !== undefined) updateUserDto.country = dto.country;
      if (dto.state !== undefined) updateUserDto.stateId = dto.state;
      if (dto.localGovernment !== undefined)
        updateUserDto.lga = dto.localGovernment;
      if (dto.picUrl !== undefined) updateUserDto.avatar = dto.picUrl;

      const updatedUser = await this.userService.update(
        userId,
        updateUserDto,
        userId,
      );

      return {
        status: HttpStatus.OK,
        message: 'Profile updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error updating profile',
        error: stringify({
          message: (error as Error)?.message || 'Unknown error',
          stack: (error as Error)?.stack,
          details: error?.response || error,
        }),
      };
    }
  }

  @Get('user/all')
  //@Roles('TUTOR', 'SUPER_ADMIN', 'ADMIN') // Class-level roles
  @ApiOperation({ summary: 'Get all users with optional filters' })
  @ApiQuery({
    name: 'username',
    required: false,
    type: String,
    description: 'Filter by username',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Filter by email',
  })
  @ApiQuery({
    name: 'referral',
    required: false,
    type: String,
    description: 'Filter by referral code',
  })
  @ApiQuery({
    name: 'isEmailVerified',
    required: false,
    type: Boolean,
    description: 'Filter by email verification status',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    type: String,
    description: 'Filter by role',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Pagination offset',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users',
    type: UserArrayResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No users found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: ResponseDto,
  })
  async findAll(@Query() userSearchDto: UserSearchDto): Promise<{
    status: number;
    message: string;
    data?: User[];
    meta?: {
      total: number;
      offset: number;
      limit: number;
      currentCount?: number;
      hasNext?: boolean;
      hasPrevious?: boolean;
    };
    error?: any;
  }> {
    try {
      const { data: users, meta } =
        await this.userService.findAll(userSearchDto);

      if (!users || users.length === 0) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'No users found',
          data: [],
          meta: { total: 0, offset: meta.offset, limit: meta.limit },
        };
      }

      return {
        status: HttpStatus.OK,
        message: 'Users retrieved successfully',
        data: users,
        meta,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User details',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: ResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  async findOneById(
    @Param('id') id: string,
  ): Promise<{ status: number; message: string; data?: User; error?: any }> {
    try {
      const user = await this.userService.findOneById(id);
      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'User retrieved successfully',
        data: user,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('user')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Optional avatar image',
        },
        email: { type: 'string' },
        password: { type: 'string' },
        fullName: { type: 'string' },
        role: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User added successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: ResponseDto,
  })
  async create(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ): Promise<{ status: number; message: string; data?: User; error?: any }> {
    try {
      const user = await this.userService.create(createUserDto, avatar);
      return {
        status: HttpStatus.CREATED,
        message: 'User added successfully',
        data: user,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Put('user/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({
    description: 'Update user profile',
    schema: {
      type: 'object',
      properties: {
        referral: { type: 'string' },
        guardianEmail: { type: 'string' },
        fullName: { type: 'string' },
        gender: { type: 'string', example: 'MALE' },
        phone: { type: 'string' },
        country: { type: 'string' },
        stateId: { type: 'string', format: 'uuid' },
        lga: { type: 'string', format: 'uuid' },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        },
        avatar: {
          type: 'string',
          format: 'binary',
        },
        systemAvatar: {
          type: 'string',
          description: 'Optional system avatar URL',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: ResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updatedUserDto: UpdateUserDto,
    @UserId() userId: string,
    @UploadedFile() avatar?: Express.Multer.File,
  ): Promise<{ status: number; message: string; data?: User; error?: any }> {
    try {
      const updatedUser = await this.userService.update(
        id,
        updatedUserDto,
        userId,
        avatar,
      );
      if (!updatedUser) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'User updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Delete('user/:id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
    type: ResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
  ): Promise<{ status: number; message: string; data?: User; error?: any }> {
    try {
      const deletedUser = await this.userService.delete(id);
      if (!deletedUser) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'User deleted successfully',
        data: deletedUser,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
