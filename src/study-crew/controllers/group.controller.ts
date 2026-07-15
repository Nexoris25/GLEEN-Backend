import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiBody,
  ApiParam,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { GroupsService } from '../services/group.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { Group } from '../models/group.model';
import { UserGroup } from '../models/user-group.model';
import stringify from 'safe-stable-stringify';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import {
  GroupResponseCountDto,
  GroupResponseDto,
  ResponseDto,
} from 'src/shared-types/response.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Groups')
@ApiBearerAuth()
@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(private readonly groupService: GroupsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  @ApiOperation({ summary: 'Create a new group' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
        name: { type: 'string' },
        description: { type: 'string' },
        openToPublic: { type: 'boolean' },
        restrictMessaging: { type: 'boolean' },
        onlyOwnerAddMembers: { type: 'boolean' },
      },
      required: ['name', 'openToPublic'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Group created successfully',
    type: GroupResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error creating group',
    type: GroupResponseDto,
  })
  async create(
    @Body() createGroupDto: CreateGroupDto,
    @UploadedFile() avatar: Express.Multer.File,
    @UserId() userId: string,
  ): Promise<GroupResponseDto> {
    try {
      // 1️⃣ Create the group
      const group = await this.groupService.create(
        createGroupDto,
        userId,
        avatar,
      );

      // 2️⃣ Add the current user (creator) as an ACCEPTED member
      await this.groupService.linkOne(userId, group.id, 'ACCEPTED');

      return {
        status: HttpStatus.CREATED,
        message: 'Group created successfully',
        data: group,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error creating group',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all groups with optional search' })
  @ApiQuery({ name: 'search', required: false, type: String })
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
    description: 'Groups retrieved successfully',
    type: GroupResponseCountDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving groups',
    type: ResponseDto<null>,
  })
  async findAll(
    @Query('search') search?: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
  ): Promise<GroupResponseCountDto> {
    try {
      const groups = await this.groupService.findAll(search, offset, limit);
      return {
        status: HttpStatus.OK,
        message: 'Groups retrieved successfully',
        data: groups,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving groups',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a group by ID' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Group retrieved successfully',
    type: GroupResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Group not found',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving group',
    type: ResponseDto<null>,
  })
  async findOne(@Param('id') id: string) {
    try {
      const group = await this.groupService.findOne(id);
      return {
        status: HttpStatus.OK,
        message: 'Group retrieved successfully',
        data: group,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving group',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a group by ID' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
        name: { type: 'string' },
        description: { type: 'string' },
        openToPublic: { type: 'boolean' },
        restrictMessaging: { type: 'boolean' },
        onlyOwnerAddMembers: { type: 'boolean' },
      },
      required: ['name', 'openToPublic'],
    },
  })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Group updated successfully',
    type: GroupResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error updating group',
    type: ResponseDto<null>,
  })
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    try {
      const updated = await this.groupService.update(
        id,
        updateGroupDto,
        avatar,
      );
      return {
        status: HttpStatus.OK,
        message: 'Group updated successfully',
        data: updated,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error updating group',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group by ID' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Group deleted successfully',
    type: ResponseDto<void>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error deleting group',
    type: ResponseDto<null>,
  })
  async remove(@Param('id') id: string) {
    try {
      await this.groupService.remove(id);
      return {
        status: HttpStatus.OK,
        message: 'Group deleted successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error deleting group',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('member/add')
  @ApiOperation({ summary: 'Add a member to a group' })
  @ApiBody({ schema: { example: { userId: '1', groupId: '2' } } })
  @ApiResponse({
    status: 200,
    description: 'Member added to group successfully',
    type: ResponseDto<UserGroup>,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseDto<null>,
  })
  async addMember(@Body() body: { userId: string; groupId: string }) {
    try {
      const result = await this.groupService.linkOne(body.userId, body.groupId);
      return {
        status: HttpStatus.OK,
        message: 'Member added to group successfully',
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

  @Post('member/add-many')
  @ApiOperation({ summary: 'Add multiple members to a group' })
  @ApiBody({ schema: { example: { userId: '1', groupIds: ['2', '3', '4'] } } })
  @ApiResponse({
    status: 200,
    description: 'Members added to group successfully',
    type: ResponseDto<UserGroup[]>,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseDto<null>,
  })
  async addMembers(@Body() body: { userId: string; groupIds: string[] }) {
    try {
      const result = await this.groupService.linkMany(
        body.userId,
        body.groupIds,
      );
      return {
        status: HttpStatus.OK,
        message: 'Members added to group successfully',
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

  @Delete('member/remove')
  @ApiOperation({ summary: 'Remove a member from a group' })
  @ApiBody({ schema: { example: { userId: '1', groupId: '2' } } })
  @ApiResponse({
    status: 200,
    description: 'Member removed from group successfully',
    type: ResponseDto<UserGroup>,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseDto<null>,
  })
  async removeMember(@Body() body: { userId: string; groupId: string }) {
    try {
      const result = await this.groupService.unlinkOne(
        body.userId,
        body.groupId,
      );
      return {
        status: HttpStatus.OK,
        message: 'Member removed from group successfully',
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

  @Delete('member/remove-many')
  @ApiOperation({ summary: 'Remove multiple members from a group' })
  @ApiBody({ schema: { example: { userId: '1', groupIds: ['2', '3', '4'] } } })
  @ApiResponse({
    status: 200,
    description: 'Members removed from group successfully',
    type: ResponseDto<UserGroup[]>,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ResponseDto<null>,
  })
  async removeMembers(@Body() body: { userId: string; groupIds: string[] }) {
    try {
      const result = await this.groupService.unlinkMany(
        body.userId,
        body.groupIds,
      );
      return {
        status: HttpStatus.OK,
        message: 'Members removed from group successfully',
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

  @Get('user/:userId/accepted')
  @ApiOperation({
    summary: 'Get all groups linked to a user with status ACCEPTED',
  })
  @ApiResponse({
    status: 200,
    description: 'Groups retrieved successfully',
    type: ResponseDto<Group[]>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving groups',
    type: ResponseDto<null>,
  })
  async getUserGroupsAccepted(@Param('userId') userId: string) {
    try {
      const groups = await this.groupService.getUserGroupsAccepted(userId);
      return {
        status: HttpStatus.OK,
        message: 'Groups retrieved successfully',
        data: groups,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving groups',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('user/:userId/pending')
  @ApiOperation({
    summary: 'Get all groups linked to a user with status PENDING',
  })
  @ApiResponse({
    status: 200,
    description: 'Groups retrieved successfully',
    type: ResponseDto<Group[]>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving groups',
    type: ResponseDto<null>,
  })
  async getUserGroupsPending(@Param('userId') userId: string) {
    try {
      const groups = await this.groupService.getUserGroupsPending(userId);
      return {
        status: HttpStatus.OK,
        message: 'Groups retrieved successfully',
        data: groups,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving groups',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('user/:userId/rejected')
  @ApiOperation({
    summary: 'Get all groups linked to a user with status REJECTED',
  })
  @ApiResponse({
    status: 200,
    description: 'Groups retrieved successfully',
    type: ResponseDto<Group[]>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving groups',
    type: ResponseDto<null>,
  })
  async getUserGroupsRejected(@Param('userId') userId: string) {
    try {
      const groups = await this.groupService.getUserGroupsRejected(userId);
      return {
        status: HttpStatus.OK,
        message: 'Groups retrieved successfully',
        data: groups,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving groups',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('user/:userId/all')
  @ApiOperation({ summary: 'Get all groups linked to a user (any status)' })
  @ApiResponse({
    status: 200,
    description: 'Groups retrieved successfully',
    type: ResponseDto<Group[]>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving groups',
    type: ResponseDto<null>,
  })
  async getAllUserGroups(@Param('userId') userId: string) {
    try {
      const groups = await this.groupService.getAllUserGroups(userId);
      return {
        status: HttpStatus.OK,
        message: 'Groups retrieved successfully',
        data: groups,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving groups',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':groupId/users/accepted')
  @ApiOperation({
    summary: 'Get all users linked to a group with status ACCEPTED',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: ResponseDto<UserGroup[]>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving users',
    type: ResponseDto<null>,
  })
  async getGroupUsersAccepted(@Param('groupId') groupId: string) {
    try {
      const users = await this.groupService.getGroupUsersAccepted(groupId);
      return {
        status: HttpStatus.OK,
        message: 'Users retrieved successfully',
        data: users,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving users',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':groupId/users/pending')
  @ApiOperation({
    summary: 'Get all users linked to a group with status PENDING',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: ResponseDto<UserGroup[]>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving users',
    type: ResponseDto<null>,
  })
  async getGroupUsersPending(@Param('groupId') groupId: string) {
    try {
      const users = await this.groupService.getGroupUsersPending(groupId);
      return {
        status: HttpStatus.OK,
        message: 'Users retrieved successfully',
        data: users,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving users',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':groupId/users/rejected')
  @ApiOperation({
    summary: 'Get all users linked to a group with status REJECTED',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: ResponseDto<UserGroup[]>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving users',
    type: ResponseDto<null>,
  })
  async getGroupUsersRejected(@Param('groupId') groupId: string) {
    try {
      const users = await this.groupService.getGroupUsersRejected(groupId);
      return {
        status: HttpStatus.OK,
        message: 'Users retrieved successfully',
        data: users,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving users',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':groupId/users/all')
  @ApiOperation({ summary: 'Get all users linked to a group (any status)' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: ResponseDto<UserGroup[]>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving users',
    type: ResponseDto<null>,
  })
  async getAllGroupUsers(@Param('groupId') groupId: string) {
    try {
      const users = await this.groupService.getAllGroupUsers(groupId);
      return {
        status: HttpStatus.OK,
        message: 'Users retrieved successfully',
        data: users,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving users',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Patch('user/:userId/group/:groupId/status')
  @ApiOperation({ summary: 'Update user group status' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiBody({ schema: { example: { status: 'ACCEPTED' } } })
  @ApiResponse({
    status: 200,
    description: 'User group status updated successfully',
    type: ResponseDto<UserGroup>,
  })
  @ApiResponse({
    status: 404,
    description: 'UserGroup link not found',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error updating user group status',
    type: ResponseDto<null>,
  })
  async updateUserGroupStatus(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
    @Body() body: { status: 'ACCEPTED' | 'DECLINED' | 'PENDING' },
  ) {
    try {
      const updated = await this.groupService.updateUserGroupStatus(
        userId,
        groupId,
        body.status,
      );
      return {
        status: HttpStatus.OK,
        message: 'User group status updated successfully',
        data: updated,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error updating user group status',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
