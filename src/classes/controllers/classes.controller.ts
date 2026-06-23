import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Delete,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ClassesService } from '../services/classes.service';
import { CreateClassDto } from '../dto/create-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { AttendanceQueryDto } from '../dto/attendance-query.dto';
import { CreateClassRecordingDto } from '../dto/create-class-recording.dto';
import { EnrollDto } from '../dto/enroll.dto';
import { RequestPrivateLessonDto } from '../dto/request-private-lesson.dto';
import { ClassEntity } from '../entities/class.entity';
import { ClassResponseDto } from '../dto/class-response.dto';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { LessonQueryDto } from 'src/lesson/dto/query.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { ResponseDto } from 'src/shared-types/response.dto';
import stringify from 'safe-stable-stringify';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // CREATE
  @ApiOperation({ summary: 'Create a new class (Teacher / Admin only)' })
  @ApiBody({ type: CreateClassDto })
  @ApiResponse({ status: 201, type: ClassResponseDto })
  @Post()
  // @Roles('TUTOR', 'ADMIN', 'SUPER_ADMIN')
  async create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  @ApiOperation({ summary: 'Request a private lesson (User only)' })
  @ApiBody({ type: RequestPrivateLessonDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Private lesson requested successfully',
    type: ResponseDto,
  })
  @Post('private-lessons/request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async requestPrivateLesson(
    @UserId() userId: string,
    @Body(new ValidationPipe()) dto: RequestPrivateLessonDto,
  ) {
    try {
      const result = await this.classesService.requestPrivateLesson(
        userId,
        dto,
      );
      return {
        status: HttpStatus.CREATED,
        message: 'Private lesson requested successfully',
        data: result.data,
      };
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Failed to request private lesson',
        error: stringify({
          message: error?.message || 'Unknown error',
          stack: error?.stack,
          details: error?.response || error,
        }),
      };
    }
  }

  // list all rooms
  @ApiOperation({ summary: 'Get all daily.co rooms' })
  @Get('rooms')
  listAllDailyRooms() {
    return this.classesService.listAllDailyRooms();
  }

  // ================= PREVIOUS CLASSES =================
  @ApiOperation({ summary: 'Get previous classes' })
  @ApiResponse({ status: 200, type: [ClassResponseDto] })
  @Get('previous')
  //@Roles('STUDENT', 'TUTOR', 'ADMIN', 'SUPER_ADMIN')
  getPreviousClasses() {
    return this.classesService.findPrevious();
  }

  // ================= UPCOMING CLASSES =================
  @ApiOperation({ summary: 'Get upcoming classes' })
  @ApiResponse({ status: 200, type: [ClassResponseDto] })
  @Get('upcoming')
  //@Roles('STUDENT', 'TUTOR', 'ADMIN', 'SUPER_ADMIN')
  getUpcomingClasses(@Query() query: PaginationDto) {
    return this.classesService.findUpcomingPaginated(query);
  }

  // ================= LIVE CLASSES =================
  @ApiOperation({ summary: 'Get live classes' })
  @ApiResponse({ status: 200, type: ClassResponseDto })
  @Get('live')
  //@Roles('STUDENT', 'TUTOR', 'ADMIN', 'SUPER_ADMIN')
  getLiveClasses(@Query() query: PaginationDto) {
    return this.classesService.findLivePaginated(query);
  }

  @ApiOperation({ summary: 'Get recommended classes for current user' })
  @ApiResponse({ status: 200, type: ClassResponseDto })
  @Get('recommended')
  getRecommendedClasses(
    @UserId() userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.classesService.findRecommended(userId, query);
  }

  @ApiOperation({
    summary: 'Get Daily.co join info (roomUrl + token) for current user',
  })
  @ApiResponse({ status: 200, type: ResponseDto })
  @Get('join/:classId')
  async getJoinInfo(
    @UserId() userId: string,
    @Param('classId') classId: string,
  ) {
    try {
      const data = await this.classesService.getJoinInfo(userId, classId);
      return {
        status: HttpStatus.OK,
        message: 'Join info retrieved successfully',
        data,
      };
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Failed to retrieve join info',
        error: stringify({
          message: error?.message || 'Unknown error',
          stack: error?.stack,
          details: error?.response || error,
        }),
      };
    }
  }
  /*
  // GET ALL with optional search
  @ApiOperation({ summary: 'Get all classes (searchable by title, classId, tutorId)' })
  @ApiResponse({ status: 200, type: [ClassResponseDto] })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title or description' })
  @ApiQuery({ name: 'tutorId', required: false, description: 'Filter by tutorId' })
  @ApiQuery({ name: 'tutorId', required: false, description: 'Filter by tutorId' })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by classId' })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('tutorId') tutorId?: string,
    @Query('id') classId?: UUID,
  ) {
    return this.classesService.findAll(search, tutorId);
  }

    // GET ALL with optional search
 
  @ApiOperation({ summary: 'Get all classes (searchable by title, classId, tutorId)' })
  @ApiResponse({ status: 200, type: [ClassResponseDto] })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title or description' })
  @ApiQuery({ name: 'tutorId', required: false, description: 'Filter by tutorId' })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by classId' })
  @UseGuards(JwtAuthGuard)
  @Get('allclass')
  findAll(
    @Query('search') search?: string,
    @Query('tutorId') tutorId?: string,
    @Query('id') classId?: UUID,
  ) {
    return this.classesService.findAll(search, tutorId);
  }
*/
  @Get('all-class')
  @ApiOperation({
    summary:
      'Get all classes. Use ?id=classId (UUID) to fetch a single class, title for searching',
  })
  @ApiResponse({
    status: 200,
    description: 'List of classes or a single class',
    type: ClassEntity,
  })
  async getAllLessons(@Query() query: LessonQueryDto) {
    return this.classesService.findAllWithDetails(query);
  }

  // GET ONE
  @ApiOperation({ summary: 'Get class by ID' })
  @ApiResponse({ status: 200, type: ClassResponseDto })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  // UPDATE CLASS
  @ApiOperation({ summary: 'Update a class by ID (Teacher / Admin)' })
  @ApiBody({ type: UpdateClassDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('TUTOR', 'ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.classesService.update(id, dto);
  }

  @Get(':id/test')
  test(@Param('id') id: string) {
    console.log('HIT!', id);
    return { ok: true };
  }

  // DELETE CLASS
  @ApiOperation({ summary: 'Delete a class by ID (Teacher / Admin)' })
  @ApiResponse({ status: 201, type: ClassResponseDto })
  @Delete(':id')
  //@Roles('TUTOR', 'ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() req, @Param('id') id: string) {
    console.log(
      'Full JWT payload decoded in req.user:',
      JSON.stringify(req.user, null, 2),
    );
    console.log('REQ.USER 👉', req.user);
    console.log('CLASS ID 👉', id);

    return this.classesService.remove(id);
  }

  // ENROLL STUDENT
  @ApiOperation({ summary: 'Enroll student into a class (Student only)' })
  @ApiBody({ type: EnrollDto })
  @Post('enroll')
  //@Roles('USER')
  enroll(@Req() req, @Body() dto: EnrollDto) {
    return this.classesService.enroll(req.user.id, dto.classId);
  }

  @ApiOperation({ summary: 'Get all attendance with pagination and search' })
  @ApiResponse({ status: 200, description: 'List of classes with attendance' })
  @Get('attendance/all')
  //@Roles('ADMIN', 'SUPER_ADMIN', 'TUTOR')
  getAttendanceList(@Query() query: AttendanceQueryDto) {
    return this.classesService.getAttendanceList(query);
  }

  @ApiOperation({ summary: 'Upload a class recording' })
  @ApiBody({ type: CreateClassRecordingDto })
  @Post('recordings')
  //@Roles('ADMIN', 'SUPER_ADMIN', 'TUTOR')
  uploadRecording(@Body() dto: CreateClassRecordingDto) {
    return this.classesService.uploadRecording(dto);
  }

  @ApiOperation({ summary: 'Get all class recordings' })
  @Get('recordings/all')
  getRecordings(@Query('subjectId') subjectId?: string) {
    return this.classesService.getRecordings(subjectId);
  }
  /*

  // MARK ATTENDANCE
  @ApiOperation({ summary: 'Mark attendance for a class (Student only)' })
  @ApiBody({ type: AttendanceDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Post('attendance')
  markAttendance(@Req() req, @Body() dto: AttendanceDto) {
    return this.classesService.markAttendance(dto.classId, req.user.id);
  }
*/
}
