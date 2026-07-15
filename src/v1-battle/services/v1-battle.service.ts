import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { V1Battle } from '../models/v1-battle.model';
import { CreateV1BattleDto } from '../dto/create-v1-battle.dto';
import { UpdateV1BattleDto } from '../dto/update-v1-battle.dto';
import { SearchV1BattleDto } from '../dto/search-v1-battle.dto';
import stringify from 'safe-stable-stringify';

@Injectable()
export class V1BattleService {
  constructor(
    @InjectModel(V1Battle)
    private readonly v1BattleModel: typeof V1Battle,
  ) {}

  async create(
    createDto: CreateV1BattleDto,
    userId: string,
  ): Promise<V1Battle> {
    try {
      return await this.v1BattleModel.create(
        { ...createDto, userId },
        { isNewRecord: true, userId },
      );
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating battle',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(
    searchDto?: SearchV1BattleDto,
  ): Promise<{ rows: V1Battle[]; count: number }> {
    try {
      const where: any = {};
      if (searchDto) {
        if (searchDto.duration) where.duration = searchDto.duration;
        if (searchDto.subjectId) where.subjectId = searchDto.subjectId;
        if (searchDto.quizId) where.quizId = searchDto.quizId;
        if (searchDto.userId) where.userId = searchDto.userId;
        if (searchDto.winnerUserId) where.winnerUserId = searchDto.winnerUserId;
        if (searchDto.opponentUserId)
          where.opponentUserId = searchDto.opponentUserId;
        if (searchDto.acceptanceStatus)
          where.acceptanceStatus = searchDto.acceptanceStatus;
      }
      return await this.v1BattleModel.findAndCountAll({
        where,
        limit: searchDto?.limit,
        offset: searchDto?.offset,
        include: ['user', 'opponentUser'],
        order: [['createdAt', 'DESC']],
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching battles',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findOne(id: string): Promise<V1Battle> {
    try {
      const battle = await this.v1BattleModel.findByPk(id);
      if (!battle) {
        throw new NotFoundException(`Battle with ID ${id} not found`);
      }
      return battle;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching battle',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async update(id: string, updateDto: UpdateV1BattleDto): Promise<V1Battle> {
    try {
      const battle = await this.findOne(id);
      return await battle.update(updateDto);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating battle',
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
      const battle = await this.findOne(id);
      await battle.destroy();
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting battle',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
