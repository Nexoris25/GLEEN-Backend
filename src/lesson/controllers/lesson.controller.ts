//write the lesson controller methods for each service method in lesson.service.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { UpdateLessonDto } from '../dto/update-lesson.dto';
import { LessonService } from '../services/lesson.service';
import {
  LessonCommentResponseCountDto,
  LessonCommentResponseDto,
  LessonResponseDto,
  LessonTrackingResponseDto,
  ResponseDto,
} from 'src/shared-types/response.dto';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { UpdateLessonCommentDto } from '../dto/update-lesson-comment.dto';
import { CreateLessonCommentDto } from '../dto/create-lesson-comment.dto';
import { CreateLessonTrackingDto } from '../dto/create-lesson-tracking.dto';
import { LessonQueryDto } from '../dto/query.dto';
import { BrowseLessonsQueryDto } from '../dto/query.dto';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import stringify from 'safe-stable-stringify';
import { Lesson } from '../models/lesson.model';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CompleteLessonDto } from '../dto/complete-lesson.dto';

@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  @Roles('TUTOR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new lesson, tutor, super admin' })
  @ApiBody({ type: CreateLessonDto })
  @ApiResponse({
    status: 201,
    description: 'Lesson created successfully',
    type: LessonResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error creating lesson',
    type: LessonResponseDto,
  })
  async create(
    @Body() createLessonDto: CreateLessonDto,
    @UserId() userId: string,
  ) {
    try {
      const lesson = await this.lessonService.create(createLessonDto, userId);
      return {
        status: 201,
        data: lesson,
        message: 'Lesson created successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error creating lesson',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  // start new
  @Get('all-lessons')
  @ApiOperation({
    summary:
      'Get all lessons with subject, tutor info, topic count and duration. Use ?id=lessonId (UUID) to fetch a single lesson, title, subtile for searching',
  })
  @ApiResponse({
    status: 200,
    description: 'List of lessons or a single lesson',
    type: Lesson,
  })
  async getAllLessons(@Query() query: LessonQueryDto) {
    return this.lessonService.findAllWithDetails(query);
  }

  @Get('browse')
  @ApiOperation({
    summary: 'Browse all lessons',
    description:
      'Fetch all lessons (video + non-video), with optional subject filters and search. Supports pagination with offset/limit.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lessons retrieved successfully',
    type: ResponseDto,
  })
  async browseLessons(
    @Query(new ValidationPipe()) query: BrowseLessonsQueryDto,
  ) {
    try {
      const data = await this.lessonService.browseAllLessons(query);
      return {
        status: 200,
        message: 'Lessons retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error retrieving lessons',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('browse/:id')
  @ApiOperation({ summary: 'Get a single lesson by ID (browse)' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson retrieved successfully',
    type: ResponseDto,
  })
  async browseLessonById(@Param('id') id: string) {
    try {
      const data = await this.lessonService.browseLessonById(id);
      return {
        status: 200,
        message: 'Lesson retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error retrieving lesson',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  // end new

  @Get(':id')
  @ApiOperation({ summary: 'Get a lesson by ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson retrieved successfully',
    type: LessonResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
    type: LessonResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving lesson',
    type: LessonResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<LessonResponseDto> {
    try {
      const lesson = await this.lessonService.findOne(id);
      return {
        status: 200,
        data: lesson,
        message: 'Lesson retrieved successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error retrieving lesson',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  /*

  @Get()
@ApiOperation({ summary: 'Get all lessons with optional search' })
@ApiResponse({ status: 200, description: 'Lessons retrieved successfully', type: LessonArrayResponseCountDto })
@ApiResponse({ status: 500, description: 'Error retrieving lessons', type: LessonResponseDto })
async findAll(@Query() searchDto: LessonSearchDto): Promise<LessonArrayResponseCountDto> {
try {
const lessons = await this.lessonService.findAll(searchDto);
return { status: 200, data: { rows: lessons.rows, count: lessons.count }, message: 'Lessons retrieved successfully' };
} catch (error) {
return {
status: 500,
message: 'Error retrieving lessons',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}

@Get(':id')
@ApiOperation({ summary: 'Get a lesson by ID' })
@ApiParam({ name: 'id', description: 'Lesson ID' })
@ApiResponse({ status: 200, description: 'Lesson retrieved successfully', type: LessonResponseDto })
@ApiResponse({ status: 404, description: 'Lesson not found', type: LessonResponseDto })
@ApiResponse({ status: 500, description: 'Error retrieving lesson', type: LessonResponseDto })
async findOne(@Param('id') id: string): Promise<LessonResponseDto> {
try {
const lesson = await this.lessonService.findOne(id);
return { status: 200, data: lesson, message: 'Lesson retrieved successfully' };
} catch (error) {
return {
status: 500,
message: 'Error retrieving lesson',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}
*/
  //@Put(':id')
  @Patch(':id')
  @Roles('TUTOR')
  @ApiOperation({ summary: 'Update a lesson by ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiBody({ type: UpdateLessonDto })
  @ApiResponse({
    status: 200,
    description: 'Lesson updated successfully',
    type: Lesson,
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
    type: LessonResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error updating lesson',
    type: LessonResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: true,
      }),
    )
    updateLessonDto: UpdateLessonDto,
  ): Promise<LessonResponseDto> {
    try {
      const lesson = await this.lessonService.update(id, updateLessonDto);
      return {
        status: 200,
        data: lesson,
        message: 'Lesson updated successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error updating lesson',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lesson by ID' })
  @ApiParam({ name: 'id', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson deleted successfully',
    schema: {
      example: { status: 200, message: 'Lesson deleted successfully' },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
    type: LessonResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error deleting lesson',
    type: LessonResponseDto,
  })
  async remove(@Param('id') id: string): Promise<ResponseDto<null>> {
    try {
      await this.lessonService.remove(id);
      return { status: 200, message: 'Lesson deleted successfully' };
    } catch (error) {
      return {
        status: 500,
        message: 'Error deleting lesson',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  // Implement similar controller methods for LessonComment and LessonTracking

  @Post('comments/:lessonId')
  @ApiOperation({ summary: 'Create a lesson comment' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiBody({ type: CreateLessonCommentDto })
  @ApiResponse({
    status: 201,
    description: 'Lesson comment created successfully',
    type: LessonCommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error creating lesson comment',
    type: ResponseDto,
  })
  async createComment(
    @Param('lessonId') lessonId: string,
    @Body() createCommentDto: CreateLessonCommentDto,
    @UserId() userId: string,
  ): Promise<LessonCommentResponseDto> {
    try {
      const comment = await this.lessonService.createComment(
        createCommentDto,
        lessonId,
        userId,
      );
      return {
        status: 201,
        data: comment,
        message: 'Lesson comment created successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error creating lesson comment',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('comments/:id')
  @ApiOperation({ summary: 'Get a lesson comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson comment retrieved successfully',
    type: LessonCommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson comment not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving lesson comment',
    type: ResponseDto,
  })
  async getComment(@Param('id') id: string): Promise<LessonCommentResponseDto> {
    try {
      const comment = await this.lessonService.findCommentById(id);
      return {
        status: 200,
        data: comment,
        message: 'Lesson comment retrieved successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error retrieving lesson comment',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('comments/lesson/:lessonId')
  @ApiOperation({ summary: 'Get all comments for a lesson by lesson ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson comments retrieved successfully',
    type: LessonCommentResponseCountDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving lesson comments',
    type: ResponseDto,
  })
  async getCommentsByLesson(
    @Param('lessonId') lessonId: string,
  ): Promise<LessonCommentResponseCountDto> {
    try {
      const comments = await this.lessonService.findCommentByLesson(lessonId);
      return {
        status: 200,
        data: comments,
        message: 'Lesson comments retrieved successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error retrieving lesson comments',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('comments/lesson/:lessonId/user/:userId')
  @ApiOperation({ summary: 'Get lesson comment by lesson ID and user ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson comment retrieved successfully',
    type: LessonCommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson comment not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving lesson comment',
    type: ResponseDto,
  })
  async getCommentByLessonAndUser(
    @Param('lessonId') lessonId: string,
    @Param('userId') userId: string,
  ): Promise<LessonCommentResponseDto> {
    try {
      const comment = await this.lessonService.findCommentByLessonAndUser(
        lessonId,
        userId,
      );
      return {
        status: 200,
        data: comment,
        message: 'Lesson comment retrieved successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error retrieving lesson comment',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Put('comments/:id')
  @ApiOperation({ summary: 'Update a lesson comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiBody({ type: UpdateLessonCommentDto })
  @ApiResponse({
    status: 200,
    description: 'Lesson comment updated successfully',
    type: LessonCommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson comment not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error updating lesson comment',
    type: ResponseDto,
  })
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateLessonCommentDto,
  ): Promise<LessonCommentResponseDto> {
    try {
      const comment = await this.lessonService.updateComment(
        id,
        updateCommentDto,
      );
      return {
        status: 200,
        data: comment,
        message: 'Lesson comment updated successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error updating lesson comment',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
  @Delete('comments/:id')
  @ApiOperation({ summary: 'Delete a lesson comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson comment deleted successfully',
    schema: {
      example: { status: 200, message: 'Lesson comment deleted successfully' },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson comment not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error deleting lesson comment',
    type: ResponseDto,
  })
  async removeComment(id: string): Promise<ResponseDto<null>> {
    try {
      await this.lessonService.removeComment(id);
      return {
        status: 200,
        data: null,
        message: 'Lesson comment deleted successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error deleting lesson comment',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('tracking')
  @ApiOperation({ summary: 'Create a lesson tracking entry for current user' })
  @ApiBody({ type: CreateLessonTrackingDto })
  @ApiResponse({
    status: 201,
    description: 'Lesson tracking created successfully',
    type: LessonTrackingResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error creating lesson tracking',
    type: ResponseDto,
  })
  async createTracking(
    @Body() createTrackingDto: CreateLessonTrackingDto,
    @UserId() userId: string,
  ): Promise<LessonTrackingResponseDto> {
    try {
      const tracking = await this.lessonService.createTracking(
        createTrackingDto.lessonId,
        userId,
      );

      return {
        status: 201,
        data: tracking,
        message: 'Lesson tracking created successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error creating lesson tracking',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  /*
@Get('tracking/:id')
@ApiOperation({ summary: 'Get a lesson tracking entry by ID' })
@ApiParam({ name: 'id', description: 'Tracking ID' })
@ApiResponse({ status: 200, description: 'Lesson tracking retrieved successfully', type: LessonTrackingResponseDto })
@ApiResponse({ status: 404, description: 'Lesson tracking not found', type: ResponseDto })
@ApiResponse({ status: 500, description: 'Error retrieving lesson tracking', type: ResponseDto })
async getTracking(@Param('id') id: string): Promise<LessonTrackingResponseDto> {
try {
const tracking = await this.lessonService.findTrackingById(id);
return {
status: 200,
data: tracking,
message: 'Lesson tracking retrieved successfully',
};
} catch (error) {
return {
status: 500,
message: 'Error retrieving lesson tracking',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}
*/

  /*
@Get('tracking/lesson/:lessonId/user/:userId')
@ApiOperation({ summary: 'Get lesson tracking by lesson ID and user ID' })
@ApiParam({ name: 'lessonId', description: 'Lesson ID' })
@ApiParam({ name: 'userId', description: 'User ID' })
@ApiResponse({ status: 200, description: 'Lesson tracking retrieved successfully', type: LessonTrackingResponseDto })
@ApiResponse({ status: 404, description: 'Lesson tracking not found', type: ResponseDto })
@ApiResponse({ status: 500, description: 'Error retrieving lesson tracking', type: ResponseDto })
async getTrackingByLessonAndUser(
@Param('lessonId') lessonId: string,
@Param('userId') userId: string
): Promise<LessonTrackingResponseDto> {
try {
const tracking = await this.lessonService.findTrackingByLessonAndUser(lessonId, userId);
return {
status: 200,
data: tracking,
message: 'Lesson tracking retrieved successfully',
};
} catch (error) {
return {
status: 500,
message: 'Error retrieving lesson tracking',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}   
*/
  @Put('tracking/complete/:lessonId')
  @ApiOperation({ summary: 'Mark lesson as completed for current user' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID', format: 'uuid' })
  @ApiBody({ type: CompleteLessonDto })
  @ApiResponse({
    status: 200,
    description: 'Lesson marked as completed',
    type: LessonTrackingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Lesson tracking not found' })
  @ApiResponse({ status: 500, description: 'Error updating lesson tracking' })
  async completeLesson(
    @Param('lessonId') lessonId: string,
    @Body() body: CompleteLessonDto,
    @UserId() userId: string,
  ): Promise<LessonTrackingResponseDto> {
    try {
      const updatedTracking = await this.lessonService.completeLessonTracking(
        lessonId,
        userId,
        body?.timeSpent,
      );

      return {
        status: 200,
        data: updatedTracking,
        message: 'Lesson marked as completed',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error updating lesson tracking',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('tracking/completed')
  @ApiOperation({
    summary:
      'Get completed lessons for current user (timeSpent, title, xpEarned, dateCompleted)',
  })
  @ApiResponse({
    status: 200,
    description: 'Completed lessons retrieved successfully',
    type: ResponseDto,
  })
  async getCompletedLessons(@UserId() userId: string) {
    try {
      const data = await this.lessonService.getCompletedLessonsSummary(userId);
      return {
        status: 200,
        message: 'Completed lessons retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error retrieving completed lessons',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  /*
@Delete('tracking/:id')
@ApiOperation({ summary: 'Delete a lesson tracking entry by ID' })
@ApiParam({ name: 'id', description: 'Tracking ID' })
@ApiResponse({ status: 200, description: 'Lesson tracking deleted successfully', schema: { example: { status: 200, message: 'Lesson tracking deleted successfully' } } })
@ApiResponse({ status: 404, description: 'Lesson tracking not found', type: ResponseDto })
@ApiResponse({ status: 500, description: 'Error deleting lesson tracking', type: ResponseDto })
async removeTracking(id: string): Promise<ResponseDto<null>> {
try {
await this.lessonService.removeTracking(id);
return {
status: 200,
data: null,
message: 'Lesson tracking deleted successfully',
};
} catch (error) {
return {
status: 500,
message: 'Error deleting lesson tracking',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}
*/
}
