import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { LessonTopicService } from '../services/lesson-topic.service';
import { CreateLessonTopicDto } from '../dto/create-lesson-topic.dto';
import { BulkCreateLessonTopicDto } from '../dto/bulk-create-lesson-topic.dto';
import { BulkUpdateLessonTopicDto } from '../dto/bulk-update-lesson-topic.dto';
import { UpdateLessonTopicDto } from '../dto/update-lesson-topic.dto';
import { SearchLessonTopicDto } from '../dto/search-lesson-topic.dto';
import stringify from 'safe-stable-stringify';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import {
  LessonTopicArrayResponseDto,
  LessonTopicResponseCountDto,
  LessonTopicResponseDto,
  ResponseDto,
} from 'src/shared-types/response.dto';

@ApiTags('Lesson Topics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lesson-topics')
export class LessonTopicController {
  constructor(private readonly lessonTopicService: LessonTopicService) {}

  @Post('bulk/:lessonId')
  @Roles('TUTOR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Bulk create lesson topics (Tutor, Super Admin)' })
  @ApiParam({
    name: 'lessonId',
    format: 'uuid',
    description: 'ID of the lesson',
  })
  @ApiBody({ type: BulkCreateLessonTopicDto })
  @ApiResponse({
    status: 201,
    description: 'Lesson topics created successfully',
    type: LessonTopicArrayResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error bulk creating lesson topics',
    type: ResponseDto,
  })
  async bulkCreate(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() bulkDto: BulkCreateLessonTopicDto,
    @UserId() userId: string,
  ): Promise<LessonTopicArrayResponseDto> {
    try {
      const topics = await this.lessonTopicService.bulkCreate(
        lessonId,
        bulkDto,
        userId,
      );

      return {
        status: HttpStatus.CREATED,
        message: 'Lesson topics created successfully',
        data: topics,
      };
    } catch (error: any) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error bulk creating lesson topics',
        error: stringify({
          message: error?.message,
          stack: error?.stack,
          details: error?.response || error,
        }),
      };
    }
  }

  @Patch('bulk/:lessonId')
  @Roles('TUTOR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Bulk update lesson topics (Tutor, Super Admin)' })
  @ApiParam({
    name: 'lessonId',
    format: 'uuid',
    description: 'ID of the lesson',
  })
  @ApiBody({ type: BulkUpdateLessonTopicDto })
  @ApiResponse({
    status: 200,
    description: 'Lesson topics updated successfully',
    type: LessonTopicArrayResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error bulk updating lesson topics',
    type: ResponseDto,
  })
  async bulkUpdate(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() bulkDto: BulkUpdateLessonTopicDto,
    @UserId() userId: string,
  ): Promise<LessonTopicArrayResponseDto> {
    try {
      const topics = await this.lessonTopicService.bulkUpdate(
        lessonId,
        bulkDto,
        userId,
      );

      return {
        status: HttpStatus.OK,
        message: 'Lesson topics updated successfully',
        data: topics,
      };
    } catch (error: any) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error bulk updating lesson topics',
        error: stringify({
          message: error?.message,
          stack: error?.stack,
          details: error?.response || error,
        }),
      };
    }
  }

  @Post()
  @Roles('TUTOR', 'SUPER_ADMIN')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'videoCaptionUrl', maxCount: 1 },
        { name: 'videoOrFileUrl', maxCount: 1 },
        { name: 'avatarOrCover', maxCount: 1 },
      ],
      {
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      },
    ),
  )
  @ApiOperation({ summary: 'Create a new lesson topic (Tutor, Super Admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        videoCaptionUrl: { type: 'string', format: 'binary' },
        videoOrFileUrl: { type: 'string', format: 'binary' },
        avatarOrCover: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        mainContent: { type: 'string' },
        description: { type: 'string' },
        subtitle: { type: 'string' },
        duration: { type: 'number' },
        lessonId: { type: 'string', format: 'uuid' },
        topicType: {
          type: 'string',
          enum: ['VIDEO', 'TEXT'], // matches your TopicTypeEnum
          default: 'VIDEO',
          description: 'Type of the topic (VIDEO or TEXT)',
        },
      },
      required: ['lessonId', 'title', 'duration'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Lesson topic created successfully',
    type: LessonTopicResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error creating lesson topic',
    type: ResponseDto,
  })
  async create(
    @Body() createDto: CreateLessonTopicDto,
    @UserId() userId: string,
    @UploadedFiles()
    files: {
      videoCaptionUrl?: Express.Multer.File[];
      videoOrFileUrl?: Express.Multer.File[];
      avatarOrCover?: Express.Multer.File[];
    },
  ): Promise<LessonTopicResponseDto> {
    try {
      const topic = await this.lessonTopicService.create(
        createDto,
        userId,
        files?.avatarOrCover?.[0],
        files?.videoOrFileUrl?.[0],
        files?.videoCaptionUrl?.[0],
      );

      return {
        status: HttpStatus.CREATED,
        message: 'Lesson topic created successfully',
        data: topic,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error creating lesson topic',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all lesson topics (optionally by search)' })
  @ApiQuery({ name: 'lessonId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'duration', required: false, type: String })
  @ApiQuery({ name: 'subtitle', required: false, type: String })
  @ApiQuery({ name: 'description', required: false, type: String })
  @ApiQuery({ name: 'mainContent', required: false, type: String })
  @ApiQuery({ name: 'avatarOrCover', required: false, type: String })
  @ApiQuery({ name: 'videoOrFileUrl', required: false, type: String })
  @ApiQuery({ name: 'videoCaptionUrl', required: false, type: String })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of items to skip',
    example: 0,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of items to return',
    example: 10,
  })
  @ApiQuery({ name: 'fileType', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Lesson topics retrieved successfully',
    type: LessonTopicResponseCountDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving lesson topics',
    type: ResponseDto,
  })
  async findAll(
    @Query() searchDto: SearchLessonTopicDto,
  ): Promise<LessonTopicResponseCountDto> {
    try {
      const topics = await this.lessonTopicService.findAll(searchDto);
      return {
        status: HttpStatus.OK,
        message: 'Lesson topics retrieved successfully',
        data: topics,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving lesson topics',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lesson topic by ID' })
  @ApiParam({ name: 'id', description: 'Lesson topic ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson topic retrieved successfully',
    type: LessonTopicResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson topic not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving lesson topic',
    type: ResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<LessonTopicResponseDto> {
    try {
      const topic = await this.lessonTopicService.findOne(id);
      return {
        status: HttpStatus.OK,
        message: 'Lesson topic retrieved successfully',
        data: topic,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving lesson topic',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
  /*
  @Put(':id')
  @Roles('TUTOR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update a lesson topic by ID' })
  @ApiParam({ name: 'id', description: 'Lesson topic ID' })
  @ApiBody({ type: UpdateLessonTopicDto })
  @ApiResponse({ status: 200, description: 'Lesson topic updated successfully', type: LessonTopicResponseDto })
  @ApiResponse({ status: 500, description: 'Error updating lesson topic', type: ResponseDto })
  async update(@Param('id') id: string, @Body() updateDto: UpdateLessonTopicDto): Promise<LessonTopicResponseDto> {
    try {
      const topic = await this.lessonTopicService.update(id, updateDto);
      return {
        status: HttpStatus.OK,
        message: 'Lesson topic updated successfully',
        data: topic,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error updating lesson topic',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
*/

  @Patch(':id')
  @Roles('TUTOR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update a lesson topic by ID' })
  @ApiParam({ name: 'id', description: 'Lesson topic ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateLessonTopicDto })
  @ApiResponse({
    status: 200,
    description: 'Lesson topic updated successfully',
    type: LessonTopicResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error updating lesson topic',
    type: ResponseDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatarOrCover', maxCount: 1 },
        { name: 'videoOrFileUrl', maxCount: 1 },
        { name: 'videoCaptionUrl', maxCount: 1 },
      ],
      {
        limits: { fileSize: 50 * 1024 * 1024 },
      },
    ),
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateLessonTopicDto,
    @UserId() userId: string,
    @UploadedFiles()
    files: {
      avatarOrCover?: Express.Multer.File[];
      videoOrFileUrl?: Express.Multer.File[];
      videoCaptionUrl?: Express.Multer.File[];
    },
  ): Promise<LessonTopicResponseDto> {
    try {
      const topic = await this.lessonTopicService.update(
        id,
        updateDto,
        userId,
        files?.avatarOrCover?.[0],
        files?.videoOrFileUrl?.[0],
        files?.videoCaptionUrl?.[0],
      );

      return {
        status: HttpStatus.OK,
        message: 'Lesson topic updated successfully',
        data: topic,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error updating lesson topic',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Delete(':id')
  @Roles('TUTOR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a lesson topic by ID' })
  @ApiParam({ name: 'id', description: 'Lesson topic ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson topic deleted successfully',
    type: LessonTopicResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error deleting lesson topic',
    type: ResponseDto,
  })
  async remove(@Param('id') id: string): Promise<LessonTopicResponseDto> {
    try {
      await this.lessonTopicService.remove(id);
      return {
        status: HttpStatus.OK,
        message: 'Lesson topic deleted successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error deleting lesson topic',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
