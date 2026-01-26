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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ClassesService } from '../services/classes.service';
import { CreateClassDto } from '../dto/create-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { EnrollDto } from '../dto/enroll.dto';
import { AttendanceDto } from '../dto/attendance.dto';
import { ClassResponseDto } from '../dto/class-response.dto';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // CREATE
  @ApiOperation({ summary: 'Create a new class (Teacher / Admin only)' })
  @ApiBody({ type: CreateClassDto })
  @ApiResponse({ status: 201, type: ClassResponseDto })
  @Post()
  @Roles('TUTOR', 'ADMIN')
  async create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }


// ================= PREVIOUS CLASSES =================
@ApiOperation({ summary: 'Get previous classes' })
@ApiResponse({ status: 200, type: [ClassResponseDto] })
@Get('previous')
@Roles('STUDENT', 'TUTOR', 'ADMIN', 'SUPER_ADMIN')
getPreviousClasses() {
  return this.classesService.findPrevious();
}

// ================= UPCOMING CLASSES =================
@ApiOperation({ summary: 'Get upcoming classes' })
@ApiResponse({ status: 200, type: [ClassResponseDto] })
@Get('upcoming')
@Roles('STUDENT', 'TUTOR', 'ADMIN', 'SUPER_ADMIN')
getUpcomingClasses() {
  return this.classesService.findUpcoming();
}

// ================= LIVE CLASSES =================
@ApiOperation({ summary: 'Get live classes' })
@ApiResponse({ status: 200, type: [ClassResponseDto] })
@Get('live')
@Roles('STUDENT', 'TUTOR', 'ADMIN', 'SUPER_ADMIN')
getLiveClasses() {
  return this.classesService.findLive();
}

  // GET ALL with optional search
  @ApiOperation({ summary: 'Get all classes (searchable by title, roomId, tutorId)' })
  @ApiResponse({ status: 200, type: [ClassResponseDto] })
  @ApiQuery({ name: 'search', required: false, description: 'Search by title or description' })
  @ApiQuery({ name: 'roomId', required: false, description: 'Filter by roomId' })
  @ApiQuery({ name: 'tutorId', required: false, description: 'Filter by tutorId' })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('roomId') roomId?: string,
    @Query('tutorId') tutorId?: string,
  ) {
    return this.classesService.findAll(search, roomId, tutorId);
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
  @Roles('TUTOR', 'ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.classesService.update(id, dto);
  }

  // DELETE CLASS
  @ApiOperation({ summary: 'Delete a class by ID (Teacher / Admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TUTOR', 'ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }

  // ENROLL STUDENT
  @ApiOperation({ summary: 'Enroll student into a class (Student only)' })
  @ApiBody({ type: EnrollDto })
  @Post('enroll')
  @Roles('USER')
  enroll(@Req() req, @Body() dto: EnrollDto) {
    return this.classesService.enroll(req.user.id, dto.classId);
  }


  // MARK ATTENDANCE
  @ApiOperation({ summary: 'Mark attendance for a class (Student only)' })
  @ApiBody({ type: AttendanceDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @Post('attendance')
  markAttendance(@Req() req, @Body() dto: AttendanceDto) {
    return this.classesService.markAttendance(dto.classId, req.user.id);
  }

}
