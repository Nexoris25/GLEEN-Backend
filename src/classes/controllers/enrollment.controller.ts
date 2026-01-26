import { Controller, Post, Body, Req, Param, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { EnrollmentService } from '../services/enrollment.service';
import { EnrollDto } from '../dto/enroll.dto';
import { ClassesService } from '../services/classes.service';

@ApiTags('Class Enrollment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('class-enrollment')
export class EnrollmentController {
  constructor(private readonly classesService: ClassesService) {}

// ENROLL STUDENT
@ApiOperation({ summary: 'Enroll student into a class (Student only)' })
@ApiBody({ type: EnrollDto })
@Post('enroll')
@Roles('USER')
enroll( @Req() req: any, @Body() dto: EnrollDto) {
return this.classesService.enroll(req.user.id, dto.classId);
}


  /*
  @Post('attendance/:classId')
  @Roles('student')
  markAttendance(@Param('classId') classId: string, @Req() req: any) {
    return this.enrollmentService.markAttendance(classId, req.user.id);
  }
  */
}
