import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GroupChat } from '../models/group-chats.model';
import { CreateGroupChatDto } from '../dto/create-group-chat.dto';
import { UpdateGroupChatDto } from '../dto/update-group-chat.dto';
import stringify from 'safe-stable-stringify';
import { CreateOptions } from 'sequelize';
import { UserGroup } from '../models/user-group.model';

@Injectable()
export class GroupChatsService {
  constructor(
    @InjectModel(GroupChat)
    private readonly groupChatModel: typeof GroupChat,
    @InjectModel(UserGroup)
    private readonly userGroupModel: typeof UserGroup,
  ) {}

  async create(
    createGroupChatDto: CreateGroupChatDto,
    userId: string,
  ): Promise<GroupChat> {
    try {
      const chat = await this.groupChatModel.create(
        {
          ...createGroupChatDto,
          userId,
        },
        { userId } as CreateOptions<GroupChat>,
      );
      return chat;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating group chat',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(
    groupId?: string,
    offset?: number,
    limit?: number,
  ): Promise<{ rows: GroupChat[]; count: number }> {
    try {
      const where = groupId ? { groupId } : undefined;
      return await this.groupChatModel.findAndCountAll({
        where,
        offset,
        limit,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching group chats',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findOne(id: string): Promise<GroupChat> {
    try {
      const chat = await this.groupChatModel.findByPk(id);
      if (!chat) {
        throw new NotFoundException(`Group chat with ID ${id} not found`);
      }
      return chat;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching group chat',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async update(
    id: string,
    updateGroupChatDto: UpdateGroupChatDto,
  ): Promise<GroupChat> {
    try {
      const chat = await this.findOne(id);
      return await chat.update(updateGroupChatDto);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating group chat',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const chat = await this.findOne(id);
      await chat.destroy();
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting group chat',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      const chat = await this.findOne(id);
      // Initialize readCount if undefined
      if (typeof chat.readCount !== 'number') chat.readCount = 0;
      chat.readCount += 1;

      // Fetch total users in the group
      const totalUsers = await this.getTotalUsersInGroup(chat.groupId);
      if (chat.readCount >= totalUsers / 2) {
        chat.status = 'READ';
      }
      await chat.save();
    } catch (error) {
      throw new BadRequestException({
        message: 'Error marking group chat as read',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
  // Dummy implementation, replace with actual logic to fetch group members
  private async getTotalUsersInGroup(groupId: string): Promise<number> {
    // TODO: Replace with actual query to count users in the group
    const users = await this.userGroupModel.findAll({ where: { groupId } });
    if (users && users.length) {
      return users.length;
    }
    // Default to 10 if no users found for safety
    return 1;
  }
}
