import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { SubjectService } from '../services/subject.service';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import { LessonQueryDto } from 'src/lesson/dto/query.dto';
import { SubjectStudentsQueryDto } from '../dto/subject-students-query.dto';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GetUser } from 'src/shared-types/user.decorator';
import { User } from 'src/user/models/user.model';
import { Subject } from '../models/subject.model';
import {
  ResponseDto,
  SubjectArrayResponseDto,
  SubjectResponseDto,
  UserSubjectArrayResponseDto,
  UserSubjectResponseDto,
} from 'src/shared-types/response.dto';
import stringify from 'safe-stable-stringify';

@ApiTags('Subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  @Roles('TUTOR', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new subject, Tutor / Super Admin' })
  @ApiBody({ type: CreateSubjectDto })
  @ApiResponse({ status: 201, description: 'Subject created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - unique title already exists',
  })
  async create(@Body() dto: CreateSubjectDto, @GetUser() user: User) {
    return this.subjectService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({
    summary:
      'Get all subjects. Use ?id=classId (UUID) to fetch a single lesson, title, description for searching',
  })
  @ApiResponse({
    status: 200,
    description: 'List of subjects or a single subject',
    type: Subject,
  })
  async getAllClasses(@Query() query: LessonQueryDto) {
    return this.subjectService.findAllWithDetails(query);
  }

  /*
@Get(':id')
@ApiOperation({ summary: 'Get a subject by ID' })
async findOne(@Param('id') id: string) {
return this.subjectService.findById(id);
}
*/
  @Patch(':id')
  @ApiOperation({ summary: 'Update a subject by ID' })
  @Roles('TUTOR', 'SUPER_ADMIN')
  @ApiBody({ type: UpdateSubjectDto })
  @ApiResponse({ status: 201, description: 'Subject updated successfully' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - unique title already exists',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a subject by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 204,
    description: 'Subject successfully deleted',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid subject ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Subject not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async remove(@Param('id') id: string) {
    return this.subjectService.remove(id);
  }

  /*
@Patch(':id/restore')
@ApiOperation({ summary: 'Restore a soft-deleted subject by ID' })
async restore(@Param('id') id: string) {
return this.subjectService.restore(id);
}
*/

  @Post('user/link-one')
  @ApiOperation({ summary: 'Link a subject to a user' })
  @ApiBody({ schema: { example: { userId: '1', subjectId: '2' } } })
  @ApiResponse({
    status: 200,
    description: 'Subject linked to user successfully',
    type: UserSubjectResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseDto,
  })
  async linkOne(
    @Body() body: { userId: string; subjectId: string },
  ): Promise<UserSubjectResponseDto> {
    try {
      const result = await this.subjectService.linkOne(
        body.userId,
        body.subjectId,
      );
      return {
        status: HttpStatus.OK,
        message: 'Subject linked to user successfully',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }

  @Post('user/link-many')
  @ApiOperation({ summary: 'Link multiple subjects to a user' })
  @ApiBody({
    schema: { example: { userId: '1', subjectIds: ['2', '3', '4'] } },
  })
  @ApiResponse({
    status: 200,
    description: 'Subjects linked to user successfully',
    type: UserSubjectArrayResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseDto,
  })
  async linkMany(
    @Body() body: { userId: string; subjectIds: string[] },
  ): Promise<UserSubjectArrayResponseDto> {
    try {
      const result = await this.subjectService.linkMany(
        body.userId,
        body.subjectIds,
      );
      return {
        status: HttpStatus.OK,
        message: 'Subjects linked to user successfully',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }

  @Delete('user/unlink-one')
  @ApiOperation({ summary: 'Unlink a subject from a user' })
  @ApiBody({ schema: { example: { userId: '1', subjectId: '2' } } })
  @ApiResponse({
    status: 200,
    description: 'Subject unlinked from user successfully',
    type: UserSubjectArrayResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  async unlinkOne(
    @Body() body: { userId: string; subjectId: string },
  ): Promise<UserSubjectArrayResponseDto> {
    try {
      await this.subjectService.unlinkOne(body.userId, body.subjectId);
      return {
        status: HttpStatus.OK,
        message: 'Subject unlinked from user successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }

  @Delete('user/unlink-many')
  @ApiOperation({ summary: 'Unlink multiple subjects from a user' })
  @ApiBody({
    schema: { example: { userId: '1', subjectIds: ['2', '3', '4'] } },
  })
  @ApiResponse({
    status: 200,
    description: 'Subjects unlinked from user successfully',
    type: UserSubjectArrayResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  async unlinkMany(
    @Body() body: { userId: string; subjectIds: string[] },
  ): Promise<UserSubjectArrayResponseDto> {
    try {
      await this.subjectService.unlinkMany(body.userId, body.subjectIds);
      return {
        status: HttpStatus.OK,
        message: 'Subjects unlinked from user successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all subjects linked to a user' })
  @ApiResponse({
    status: 200,
    description: 'Subjects retrieved successfully',
    type: SubjectArrayResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving subjects',
    type: ResponseDto,
  })
  async getUserSubjects(
    @Param('userId') userId: string,
  ): Promise<SubjectArrayResponseDto> {
    try {
      const subjects = await this.subjectService.getUserSubjects(userId);
      return {
        status: HttpStatus.OK,
        message: 'Subjects retrieved successfully',
        data: subjects,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving subjects',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':id/students')
  @ApiOperation({
    summary: 'Get students registered for a subject',
    description:
      'Returns paginated students registered for a subject with activity counts and rewards data.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Students retrieved successfully',
    type: ResponseDto,
  })
  @Roles('ADMIN', 'SUPER_ADMIN', 'TUTOR')
  async getStudentsForSubject(
    @Param('id') subjectId: string,
    @Query() query: SubjectStudentsQueryDto,
  ) {
    try {
      const data = await this.subjectService.getStudentsForSubject(
        subjectId,
        query,
      );
      return {
        status: HttpStatus.OK,
        message: 'Students retrieved successfully',
        data,
      };
    } catch (error: any) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error retrieving students for subject',
        error: stringify({
          message: (error as Error)?.message || 'Unknown error',
          stack: (error as Error)?.stack,
          details: error?.response || error,
        }),
      };
    }
  }
}
