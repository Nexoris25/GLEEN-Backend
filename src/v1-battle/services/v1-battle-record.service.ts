import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { V1BattleRecord } from '../models/v1-battle-record.model';
import { CreateV1BattleRecordDto } from '../dto/create-v1-battle-record.dto';
import { UpdateV1BattleRecordDto } from '../dto/update-v1-battle-record.dto';
import { SearchV1BattleRecordDto } from '../dto/search-v1-battle-record.dto';
import stringify from 'safe-stable-stringify';
import { V1BattleQuestionAnswersService } from './v1-battle-question-answers.service';
import { XpLogService } from 'src/xp/services/xp-log.service';
import { XpConfiguration } from 'src/xp/models/xp-configuration.model';

@Injectable()
export class V1BattleRecordService {
  constructor(
    @InjectModel(V1BattleRecord)
    private readonly v1BattleRecordModel: typeof V1BattleRecord,
    private readonly v1BattleQuestionAnswersService: V1BattleQuestionAnswersService,
    private readonly xpLogService: XpLogService,
  ) { }

  async create(createDto: CreateV1BattleRecordDto, userId: string): Promise<V1BattleRecord> {
    try {
      return await this.v1BattleRecordModel.create({ ...createDto, userId }, { isNewRecord: true, userId });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating V1 Battle Record',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(searchDto?: SearchV1BattleRecordDto): Promise<{ rows: V1BattleRecord[]; count: number }> {
    try {
      const where: any = {};
      if (searchDto) {
        if (searchDto.v1BattleId) where.vOneBattleId = searchDto.v1BattleId;
        if (searchDto.userId) where.userId = searchDto.userId;
      }
      return await this.v1BattleRecordModel.findAndCountAll({
        where,
        limit: (searchDto as any)?.limit,
        offset: (searchDto as any)?.offset,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching V1 Battle Records',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findOne(id: string): Promise<V1BattleRecord> {
    try {
      const record = await this.v1BattleRecordModel.findByPk(id, {
        include: [
          {
            association: "vOneBattle", 
            include: [
              { association: "opponentUser"},
              { association: "user" }
             ]
          }
        ]
      });
      if (!record) {
        throw new NotFoundException(`V1 Battle Record with ID ${id} not found`);
      }
      return record;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching V1 Battle Record',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async update(id: string, updateDto: UpdateV1BattleRecordDto): Promise<V1BattleRecord> {
    try {
      const record = await this.findOne(id);
      return await record.update(updateDto);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating V1 Battle Record',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }


  async updateCompleted(id: string): Promise<V1BattleRecord> {
    try {
      const record = await this.findOne(id);
      if (record.endedAt == null) {

        const answersWithCount = await this.v1BattleQuestionAnswersService.findAll({
          userId: record.userId,
          vOneBattleId: record.vOneBattleId,
          offset: 0,
          limit: 1000,
        });
        const totalScore = answersWithCount.rows.reduce((sum, answer) => sum + (answer.score || 0), 0);

        await record.update({ endedAt: new Date(), totalScore });
        const xpConfig: XpConfiguration = await this.xpLogService.getXpConfig();
        let xpValue: number;
        if (totalScore <= 10) {
          xpValue = xpConfig.xpValueForLessThanOrEqualTo10QuizQuestion;
        } else if (totalScore > 10 && totalScore <= 20) {
          xpValue = xpConfig.xpValueForGreaterThan10LessThanOrEqualTo20QuizQuestion;
        } else if (totalScore > 20 && totalScore <= 30) {
          xpValue = xpConfig.xpValueForGreaterThan20LessThanOrEqualTo30QuizQuestion;
        } else if (totalScore > 30) {
          xpValue = xpConfig.xpValueForGreaterThan30QuizQuestion;
        }
        await this.xpLogService.create({
          userId: record?.userId,
          xpValue: xpValue,
          xpType: "v1_battle",
          detail: `xp bonus for 1v1 battle between ${record.vOneBattle.user.username} and ${record.vOneBattle.opponentUser.username}`,
        });
        return record;
      }
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating V1 Battle Record',
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
      const record = await this.findOne(id);
      await record.destroy();
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting V1 Battle Record',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
