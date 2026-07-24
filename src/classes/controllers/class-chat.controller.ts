import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import stringify from 'safe-stable-stringify';
import { ClassChatService } from '../services/class-chat.service';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { ResponseDto } from 'src/shared-types/response.dto';

@ApiTags('Class Chats')
@ApiBearerAuth()
@Controller('class-chats')
@UseGuards(JwtAuthGuard)
export class ClassChatController {
  constructor(private readonly classChatService: ClassChatService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message in a class chat' })
  @ApiBody({ schema: { example: { classId: 'uuid', message: 'Hello!' } } })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async create(
    @Body() body: { classId: string; message: string },
    @UserId() userId: string,
  ) {
    try {
      const chat = await this.classChatService.create(body, userId);
      return {
        status: HttpStatus.CREATED,
        message: 'Message sent successfully',
        data: chat,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error sending message',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get messages for a class' })
  @ApiQuery({ name: 'classId', required: true, type: String })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Messages retrieved' })
  async findAll(
    @Query('classId') classId: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
  ): Promise<ResponseDto<{ rows: any[]; count: number }>> {
    try {
      const chats = await this.classChatService.findAll(classId, offset, limit);
      return {
        status: HttpStatus.OK,
        message: 'Messages retrieved successfully',
        data: chats,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving messages',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
