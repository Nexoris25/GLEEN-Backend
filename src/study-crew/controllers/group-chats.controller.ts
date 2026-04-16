import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GroupChatsService } from '../services/group-chats.service';
import { CreateGroupChatDto } from '../dto/create-group-chat.dto';
import { UpdateGroupChatDto } from '../dto/update-group-chat.dto';
import stringify from 'safe-stable-stringify';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import {
  GroupChatResponseCountDto,
  GroupChatResponseDto,
  ResponseDto,
} from 'src/shared-types/response.dto';

@ApiTags('Group Chats')
@Controller('group-chats')
@UseGuards(JwtAuthGuard)
export class GroupChatsController {
  constructor(private readonly groupChatsService: GroupChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group chat message' })
  @ApiBody({ type: CreateGroupChatDto })
  @ApiResponse({
    status: 201,
    description: 'Group chat created successfully',
    type: GroupChatResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Error creating group chat' })
  async create(
    @Body() createGroupChatDto: CreateGroupChatDto,
    @UserId() userId: string,
  ): Promise<GroupChatResponseDto> {
    try {
      const chat = await this.groupChatsService.create(
        createGroupChatDto,
        userId,
      );
      return {
        status: HttpStatus.CREATED,
        message: 'Group chat created successfully',
        data: chat,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error creating group chat',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all group chat messages (optionally by group)',
  })
  @ApiQuery({ name: 'groupId', required: false, type: String })
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
    description: 'Number of items to return',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Group chats retrieved successfully',
    type: GroupChatResponseCountDto,
  })
  @ApiResponse({ status: 500, description: 'Error retrieving group chats' })
  async findAll(
    @Query('groupId') groupId?: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
  ): Promise<GroupChatResponseCountDto> {
    try {
      const chats = await this.groupChatsService.findAll(
        groupId,
        offset,
        limit,
      );
      return {
        status: HttpStatus.OK,
        message: 'Group chats retrieved successfully',
        data: chats,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving group chats',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a group chat message by ID' })
  @ApiParam({ name: 'id', description: 'Group chat ID' })
  @ApiResponse({
    status: 200,
    description: 'Group chat retrieved successfully',
    type: GroupChatResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Group chat not found' })
  @ApiResponse({ status: 500, description: 'Error retrieving group chat' })
  async findOne(@Param('id') id: string): Promise<GroupChatResponseDto> {
    try {
      const chat = await this.groupChatsService.findOne(id);
      return {
        status: HttpStatus.OK,
        message: 'Group chat retrieved successfully',
        data: chat,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving group chat',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a group chat message by ID' })
  @ApiParam({ name: 'id', description: 'Group chat ID' })
  @ApiBody({ type: UpdateGroupChatDto })
  @ApiResponse({
    status: 200,
    description: 'Group chat updated successfully',
    type: GroupChatResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Error updating group chat' })
  async update(
    @Param('id') id: string,
    @Body() updateGroupChatDto: UpdateGroupChatDto,
  ): Promise<GroupChatResponseDto> {
    try {
      const chat = await this.groupChatsService.update(id, updateGroupChatDto);
      return {
        status: HttpStatus.OK,
        message: 'Group chat updated successfully',
        data: chat,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error updating group chat',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group chat message by ID' })
  @ApiParam({ name: 'id', description: 'Group chat ID' })
  @ApiResponse({ status: 200, description: 'Group chat deleted successfully' })
  @ApiResponse({ status: 500, description: 'Error deleting group chat' })
  async remove(@Param('id') id: string): Promise<ResponseDto<void>> {
    try {
      await this.groupChatsService.remove(id);
      return {
        status: HttpStatus.OK,
        message: 'Group chat deleted successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error deleting group chat',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
