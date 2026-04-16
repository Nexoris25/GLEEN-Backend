import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateOptions, Op } from 'sequelize';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { Group } from '../models/group.model';
import { UserGroup } from '../models/user-group.model';
import { BunnyService } from 'src/common/services/bunny-all.service';
import stringify from 'safe-stable-stringify';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group)
    private groupModel: typeof Group,
    private readonly bunnyService: BunnyService,
    @InjectModel(UserGroup)
    private readonly userGroupModel: typeof UserGroup,
  ) {}

  async create(
    createGroupDto: CreateGroupDto,
    userId: string,
    avatar?: Express.Multer.File,
  ): Promise<Group> {
    let avatarUrl: string | null = null;
    const updatedData: any = { ...createGroupDto };
    if (avatar) {
      avatarUrl = await this.bunnyService.upload({
        buffer: avatar.buffer,
        mimeType: avatar.mimetype,
        originalName: avatar.originalname,
        directory: 'groups',
      });

      updatedData.avatar = avatarUrl;
    }

    try {
      return await this.groupModel.create(updatedData, {
        userId,
      } as CreateOptions<any>);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating group',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(
    search?: string,
    offset?: number,
    limit?: number,
  ): Promise<{ rows: Group[]; count: number }> {
    try {
      const where: any = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }
      return await this.groupModel.findAndCountAll({ where, offset, limit });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching groups',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findOne(id: string): Promise<Group> {
    try {
      const group = await this.groupModel.findByPk(id);
      if (!group) {
        throw new NotFoundException(`Group with ID ${id} not found`);
      }
      return group;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching group',
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
    updateGroupDto: UpdateGroupDto,
    avatar?: Express.Multer.File,
  ): Promise<Group> {
    let avatarUrl: string | null = null;
    const updatedData: any = { ...updateGroupDto };

    try {
      const group = await this.findOne(id);

      if (avatar) {
        avatarUrl = await this.bunnyService.upload({
          buffer: avatar.buffer,
          mimeType: avatar.mimetype,
          originalName: avatar.originalname,
          directory: 'groups',
        });

        updatedData.avatar = avatarUrl;
        console.log('avatarUrl', avatarUrl);
      }

      if (!group) {
        throw new NotFoundException(`Group with ID '${id}' not found`);
      }
      return await group.update(updatedData);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating group',
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
      const group = await this.findOne(id);
      await group.destroy();
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting group',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async linkOne(userId: string, groupId: string) {
    try {
      return await this.userGroupModel.create({ userId, groupId });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error linking user to group',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async linkMany(userId: string, groupIds: string[]) {
    try {
      const records = groupIds.map((groupId) => ({ userId, groupId }));
      return await this.userGroupModel.bulkCreate(records, {
        ignoreDuplicates: true,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error linking multiple users to group',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async unlinkOne(userId: string, groupId: string) {
    try {
      return await this.userGroupModel.destroy({ where: { userId, groupId } });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error unlinking user from group',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async unlinkMany(userId: string, groupIds: string[]) {
    try {
      return await this.userGroupModel.destroy({
        where: { userId, groupId: groupIds },
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error unlinking multiple users from group',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async getUserGroupsAccepted(userId: string): Promise<Group[]> {
    try {
      return await this.groupModel.findAll({
        include: [
          {
            association: 'users',
            where: { id: userId },
            attributes: [],
            through: {
              where: { status: 'ACCEPTED' },
            },
          },
        ],
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching user groups',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async getUserGroupsPending(userId: string): Promise<Group[]> {
    try {
      return await this.groupModel.findAll({
        include: [
          {
            association: 'users',
            where: { id: userId },
            attributes: [],
            through: {
              where: { status: 'PENDING' },
            },
          },
        ],
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching user groups',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async getUserGroupsRejected(userId: string): Promise<Group[]> {
    try {
      return await this.groupModel.findAll({
        include: [
          {
            association: 'users',
            where: { id: userId },
            attributes: [],
            through: {
              where: { status: 'REJECTED' },
            },
          },
        ],
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching user groups',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async getAllUserGroups(userId: string): Promise<Group[]> {
    try {
      return await this.groupModel.findAll({
        include: [
          {
            association: 'users',
            where: { id: userId },
            attributes: [],
          },
        ],
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching user groups',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async getGroupUsersAccepted(groupId: string): Promise<UserGroup[]> {
    try {
      return await this.userGroupModel.findAll({
        where: { groupId, status: 'ACCEPTED' },
        include: [
          {
            association: 'user',
          },
        ],
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching group users',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async getGroupUsersPending(groupId: string): Promise<UserGroup[]> {
    try {
      return await this.userGroupModel.findAll({
        where: { groupId, status: 'PENDING' },
        include: [
          {
            association: 'user',
          },
        ],
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching group users',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async getGroupUsersRejected(groupId: string): Promise<UserGroup[]> {
    try {
      return await this.userGroupModel.findAll({
        where: { groupId, status: 'REJECTED' },
        include: [
          {
            association: 'user',
          },
        ],
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching group users',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async getAllGroupUsers(groupId: string): Promise<UserGroup[]> {
    try {
      return await this.userGroupModel.findAll({
        where: { groupId },
        include: [
          {
            association: 'user',
          },
        ],
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching group users',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async updateUserGroupStatus(
    userId: string,
    groupId: string,
    status: 'ACCEPTED' | 'DECLINED' | 'PENDING',
  ): Promise<UserGroup> {
    try {
      const userGroup = await this.userGroupModel.findOne({
        where: { userId, groupId },
      });
      if (!userGroup) {
        throw new NotFoundException(
          `UserGroup link not found for userId ${userId} and groupId ${groupId}`,
        );
      }
      userGroup.status = status;
      return await userGroup.save();
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating user group status',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
