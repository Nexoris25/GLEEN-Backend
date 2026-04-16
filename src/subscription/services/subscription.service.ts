import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Subscription } from '../models/Subscription.model';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from '../dto/subscription.dto';
import stringify from 'safe-stable-stringify';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription)
    private readonly subscriptionModel: typeof Subscription,
  ) {}

  async create(
    dto: CreateSubscriptionDto,
    userId: string,
  ): Promise<Subscription> {
    try {
      return await this.subscriptionModel.create({ ...dto, userId });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating subscription',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAllAllUsers(offset = 0, limit = 10) {
    const safeLimit = Math.min(limit, 100); // max cap
    const safeOffset = Math.max(offset, 0);

    const { count, rows } = await this.subscriptionModel.findAndCountAll({
      offset: safeOffset,
      limit: safeLimit,
      order: [['createdAt', 'DESC']],
    });

    return { count, rows };
  }

  async findAll(
    userId: string,
    offset = 0,
    limit = 10,
  ): Promise<{ rows: Subscription[]; count: number }> {
    try {
      return await this.subscriptionModel.findAndCountAll({
        where: { userId },
        offset,
        limit,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching subscriptions',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findOne(id: string, userId: string): Promise<Subscription> {
    const sub = await this.subscriptionModel.findOne({ where: { id, userId } });
    if (!sub) {
      throw new NotFoundException(`Subscription ${id} not found`);
    }
    return sub;
  }

  async update(
    id: string,
    dto: UpdateSubscriptionDto,
    userId: string,
  ): Promise<Subscription> {
    const sub = await this.findOne(id, userId);
    try {
      return await sub.update(dto as any);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating subscription',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await this.subscriptionModel.destroy({
      where: { id, userId },
    });
    if (!deleted) {
      throw new NotFoundException(
        `Subscription ${id} not found or not allowed`,
      );
    }
  }
}
