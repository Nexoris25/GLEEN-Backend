import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QuizRecord } from '../models/quiz-record.model';
import { CreateQuizRecordDto } from '../dto/create-quiz-record.dto';
import { UpdateQuizRecordDto } from '../dto/update-quiz-record.dto';
import { SearchQuizRecordDto } from '../dto/search-quiz-record.dto';
import stringify from 'safe-stable-stringify';
import { XpLogService } from 'src/xp/services/xp-log.service';
import { StudentsQuizAnswersService } from './student-quiz-answer.service';
import { XpConfiguration } from 'src/xp/models/xp-configuration.model';

@Injectable()
export class QuizRecordService {
  constructor(
    @InjectModel(QuizRecord)
    private readonly quizRecordModel: typeof QuizRecord,
    private readonly studentQuizAnswerService: StudentsQuizAnswersService,
    private readonly xpLogService: XpLogService,
  ) { }

  async create(createDto: CreateQuizRecordDto, userId: string): Promise<QuizRecord> {
    try {
      return await this.quizRecordModel.create({ ...createDto, userId }, { isNewRecord: true, userId: userId });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating quiz record',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(search?: SearchQuizRecordDto): Promise<{ rows: QuizRecord[]; count: number }> {
    try {
      const where: any = {};
      if (search) {
        if (search.quizId) where.quizId = search.quizId;
        if (search.userId) where.userId = search.userId;
        if (search.totalMarks !== undefined) where.totalMarks = search.totalMarks;
        if (search.obtainedMarks !== undefined) where.obtainedMarks = search.obtainedMarks;
        if (search.totalQuestions !== undefined) where.totalQuestions = search.totalQuestions;
        if (search.totalAnsweredQuestions !== undefined) where.totalAnsweredQuestions = search.totalAnsweredQuestions;
        if (search.totalUnansweredQuestions !== undefined) where.totalUnansweredQuestions = search.totalUnansweredQuestions;
        if (search.correctAnswers !== undefined) where.correctAnswers = search.correctAnswers;
        if (search.incorrectAnswers !== undefined) where.incorrectAnswers = search.incorrectAnswers;
        if (search.endedAt) where.endedAt = search.endedAt;
        if (search.startedAt) where.startedAt = search.startedAt;
      }
      return await this.quizRecordModel.findAndCountAll({ where, offset: search?.offset, limit: search?.limit });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching quiz records',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findOne(id: string): Promise<QuizRecord> {
    try {
      const record = await this.quizRecordModel.findByPk(id, {
        include: [{ association: "quizzes" }]
      });
      if (!record) {
        throw new NotFoundException(`Quiz record with ID ${id} not found`);
      }
      return record;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching quiz record',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async update(id: string, updateDto: UpdateQuizRecordDto): Promise<QuizRecord> {
    try {
      const record = await this.findOne(id);
      return await record.update(updateDto);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating quiz record',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async updateCompleted(id: string): Promise<QuizRecord> {
    try {
      const record = await this.findOne(id);
      if (record.endedAt == null) {

        const answersWithCount = await this.studentQuizAnswerService.findAll({
          userId: record.userId,
          quizRecordId: record.id,
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
          xpType: "quiz_completion",
          detail: `xp bonus for quiz with title ${record.quizzes.title} `
        });
        return record;
      }
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating quiz record',
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
        message: 'Error deleting quiz record',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
