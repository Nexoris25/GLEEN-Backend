import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateOptions, Op } from 'sequelize';
import { CreateGoalDto } from '../dto/create-goal.dto';
import { UpdateGoalDto } from '../dto/update-goal.dto';
import { Goal } from '../models/goal.model';
import { UserGoal } from '../models/user-goal.model';
import stringify from 'safe-stable-stringify';

@Injectable()
export class GoalsService {
  constructor(
    @InjectModel(Goal)
    private goalModel: typeof Goal,
    @InjectModel(UserGoal)
    private readonly userGoalModel: typeof UserGoal,
  ) {}

  async create(createGoalDto: CreateGoalDto, userId: string): Promise<Goal> {
    try {
      return await this.goalModel.create(
        createGoalDto as any,
        { userId } as CreateOptions<any>,
      );
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating goal',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(search?: string): Promise<Goal[]> {
    try {
      const where: any = {};
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }
      return await this.goalModel.findAll({ where });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching goals',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findOne(id: string): Promise<Goal> {
    try {
      const goal = await this.goalModel.findByPk(id);
      if (!goal) {
        throw new NotFoundException(`Goal with ID ${id} not found`);
      }
      return goal;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching goal',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async update(id: string, updateGoalDto: UpdateGoalDto): Promise<Goal> {
    try {
      const goal = await this.findOne(id);
      return await goal.update(updateGoalDto);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating goal',
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
      const goal = await this.findOne(id);
      await goal.destroy();
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting goal',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async linkOne(userId: string, goalId: string) {
    try {
      return await this.userGoalModel.create({ userId, goalId });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error linking goal to user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async linkMany(userId: string, goalIds: string[]) {
    try {
      const records = goalIds.map((goalId) => ({ userId, goalId }));
      return await this.userGoalModel.bulkCreate(records, {
        ignoreDuplicates: true,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error linking multiple goals to user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async unlinkOne(userId: string, goalId: string) {
    try {
      return await this.userGoalModel.destroy({ where: { userId, goalId } });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error unlinking goal from user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async unlinkMany(userId: string, goalIds: string[]) {
    try {
      return await this.userGoalModel.destroy({
        where: { userId, goalId: goalIds },
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error unlinking multiple goals from user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      return await this.goalModel.findAll({
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
        message: 'Error fetching user goals',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
