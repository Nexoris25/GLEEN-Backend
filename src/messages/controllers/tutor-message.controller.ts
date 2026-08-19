// src/messages/controllers/tutor-message.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
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
  @Roles('TUTOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary:
      'Send a message to students. Targets combine as a union: sendToAll, stateIds, subjectIds, classIds and/or studentIds. Recipients read it via GET /notification-tracking.',
  })
  create(@Body() dto: CreateTutorMessageDto, @UserId() senderId: string) {
    return this.service.create(dto, senderId);
  }
}
