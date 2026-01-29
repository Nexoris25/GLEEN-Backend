// src/messages/controllers/tutor-message.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { TutorMessageService } from '../services/tutor-message.service';
import { CreateTutorMessageDto } from '../dto/create-tutor-message.dto';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';

@ApiTags('Tutor Messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tutor-messages')
export class TutorMessageController {
  constructor(private readonly service: TutorMessageService) {}

  @Post()
  @Roles('TUTOR')
  @ApiOperation({ summary: 'Tutor sends message to students. only one option used (studentId / sendToAll / stateId /subjectId / classIds' })
  create(
    @Body() dto: CreateTutorMessageDto,
    @UserId() tutorId: string,
  ) {
    return this.service.create(dto, tutorId);
  }


  /*
  @Get('student')
  @Roles('STUDENT')
  getStudentMessages(@UserId() studentId: string) {
    return this.service.getStudentMessages(studentId);
  }

  @Patch(':id/read')
  @Roles('STUDENT')
  markRead(@Param('id') id: string, @UserId() studentId: string) {
    return this.service.markAsRead(id, studentId);
  }
  */
}
