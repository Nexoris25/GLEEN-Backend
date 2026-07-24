import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MockExamRecord } from '../models/mock-exam-record.model';
import { CreateMockExamRecordDto } from '../dtos/create-mock-exam-record.dto';
import { UpdateMockExamRecordDto } from '../dtos/update-mock-exam-record.dto';
import { SearchMockExamRecordDto } from '../dtos/search-mock-exam-record.dto';
import stringify from 'safe-stable-stringify';
import { XpLogService } from 'src/xp/services/xp-log.service';
import { StudentsMockAnswersService } from './student-mock-answers.service';
import { XpConfiguration } from 'src/xp/models/xp-configuration.model';

@Injectable()
export class MockExamRecordService {
  constructor(
    @InjectModel(MockExamRecord)
    private readonly mockExamRecordModel: typeof MockExamRecord,
    private readonly studentsMockAnswersService: StudentsMockAnswersService,
    private readonly xpLogService: XpLogService,
  ) {}

  async create(
    createDto: CreateMockExamRecordDto,
    userId: string,
  ): Promise<MockExamRecord> {
    try {
      const weekStart = MockExamRecord.getIsoWeekStartDateOnly(new Date());

      // A student may only have one attempt per exam per week (unique index on
      // mockExamId + userId + weekStart). If one already exists, restart it in
      // place — clear the previous answers and stats — instead of erroring.
      const existing = await this.mockExamRecordModel.findOne({
        where: { mockExamId: createDto.mockExamId, userId, weekStart },
      });

      if (existing) {
        await this.studentsMockAnswersService.deleteByExamRecord(existing.id);
        await existing.update({
          startedAt: createDto.startedAt ?? new Date().toISOString(),
          endedAt: null,
          totalMarks: null,
          obtainedMarks: null,
          totalQuestions: null,
          totalAnsweredQuestions: null,
          totalUnansweredQuestions: null,
          correctAnswers: null,
          incorrectAnswers: null,
        });
        return existing;
      }

      return await this.mockExamRecordModel.create(
        { ...createDto, userId },
        { isNewRecord: true, userId: userId },
      );
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating mock exam record',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAllWithCount(
    search?: SearchMockExamRecordDto,
  ): Promise<{ rows: MockExamRecord[]; count: number }> {
    try {
      const where: any = {};
      if (search) {
        if (search.mockExamId) where.mockExamId = search.mockExamId;
        if (search.userId) where.userId = search.userId;
        if (search.totalMarks !== undefined)
          where.totalMarks = search.totalMarks;
        if (search.obtainedMarks !== undefined)
          where.obtainedMarks = search.obtainedMarks;
        if (search.totalQuestions !== undefined)
          where.totalQuestions = search.totalQuestions;
        if (search.totalAnsweredQuestions !== undefined)
          where.totalAnsweredQuestions = search.totalAnsweredQuestions;
        if (search.totalUnansweredQuestions !== undefined)
          where.totalUnansweredQuestions = search.totalUnansweredQuestions;
        if (search.correctAnswers !== undefined)
          where.correctAnswers = search.correctAnswers;
        if (search.incorrectAnswers !== undefined)
          where.incorrectAnswers = search.incorrectAnswers;
        if (search.endedAt) where.endedAt = search.endedAt;
        if (search.startedAt) where.startedAt = search.startedAt;
      }
      return await this.mockExamRecordModel.findAndCountAll({
        where,
        offset: search?.offset,
        limit: search?.limit,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching mock exam records',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findOne(id: string): Promise<MockExamRecord> {
    try {
      const record = await this.mockExamRecordModel.findByPk(id, {
        include: [
          {
            association: 'mockExam',
          },
        ],
      });
      if (!record) {
        throw new NotFoundException(`Mock exam record with ID ${id} not found`);
      }
      return record;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching mock exam record',
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
    updateDto: UpdateMockExamRecordDto,
  ): Promise<MockExamRecord> {
    try {
      const record = await this.findOne(id);
      return await record.update(updateDto);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating mock exam record',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async updateCompleted(id: string): Promise<MockExamRecord> {
    try {
      const record = await this.findOne(id);

      // Idempotent: once an attempt is completed, don't finalise/award again.
      if (record.endedAt != null) {
        return record;
      }

      const answersWithCount = await this.studentsMockAnswersService.findAll({
        userId: record.userId,
        mockExamRecordId: record.id,
        offset: 0,
        limit: 1000,
      });
      const totalScore = answersWithCount.rows.reduce(
        (sum, answer) => sum + (answer.score || 0),
        0,
      );

      await record.update({ endedAt: new Date().toISOString() });

      const xpConfig: XpConfiguration = await this.xpLogService.getXpConfig();
      let xpValue: number;
      if (totalScore <= 10) {
        xpValue = xpConfig.xpValueForLessThanOrEqualTo10MockQuestion;
      } else if (totalScore <= 20) {
        xpValue =
          xpConfig.xpValueForGreaterThan10LessThanOrEqualTo20MockQuestion;
      } else if (totalScore <= 30) {
        xpValue =
          xpConfig.xpValueForGreaterThan20LessThanOrEqualTo30MockQuestion;
      } else {
        xpValue = xpConfig.xpValueForGreaterThan30MockQuestion;
      }
      xpValue = this.xpLogService.applyXpMultiplier(
        xpConfig,
        'MOCK_EXAM_XP',
        xpValue,
      );

      await this.xpLogService.create({
        userId: record.userId,
        xpValue,
        xpType: 'quiz_completion',
        detail: `xp bonus for mock exam with title ${record.mockExam?.title ?? ''}`,
      });

      return record;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating mock exam record',
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
        message: 'Error deleting mock exam record',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
