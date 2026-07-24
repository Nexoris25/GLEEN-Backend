import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import stringify from 'safe-stable-stringify';
import { StudentsMockAnswers } from '../models/students-mock-answers.model';
import { SearchMockAnswerDto } from '../dtos/search-mock-answer.dto';
import { Op } from 'sequelize';
import { MockQuestionsService } from './mock-questions.service';
import { MockExamRecord } from '../models/mock-exam-record.model';

@Injectable()
export class StudentsMockAnswersService {
  constructor(
    @InjectModel(StudentsMockAnswers)
    private studentsMockAnswersModel: typeof StudentsMockAnswers,
    private readonly mockQuestionService: MockQuestionsService,
  ) {}

  async create(
    answerData: {
      mockQuestionId: string;
      answer: string;
      mockExamRecordId: string;
    },
    userId: string,
  ): Promise<StudentsMockAnswers> {
    try {
      const { mockQuestionId, mockExamRecordId, answer } = answerData;
      const mockQuestion =
        await this.mockQuestionService.findById(mockQuestionId);

      if (!mockQuestion) {
        throw new Error('Mock Question for the given Id Could not be found');
      }

      const score =
        mockQuestion.correctAnswer.toLowerCase() === answer.toLowerCase() ||
        mockQuestion.correctAnswer === answer
          ? 1
          : 0;
      const newAnswer = await this.studentsMockAnswersModel.create(
        { mockQuestionId, mockExamRecordId, answer, score },
        { isNewRecord: true, userId },
      );

      // Compute and update exam record after answer creation
      await this.computeAndUpdateExamRecord(newAnswer.mockQuestionId, userId);

      return newAnswer;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating student mock answer:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(
    searchDto: SearchMockAnswerDto,
  ): Promise<{ count: number; rows: StudentsMockAnswers[] }> {
    try {
      const { limit, offset, ...filters } = searchDto;
      const where: any = { ...filters };
      if (filters.userId) {
        where.userId = filters.userId;
      }
      if (filters.mockQuestionId) {
        where.mockQuestionId = filters.mockQuestionId;
      }
      if (filters.mockExamRecordId) {
        where.mockExamRecordId = filters.mockExamRecordId;
      }
      if (filters.answer) {
        where.answer = { [Op.iLike]: `%${filters.answer}%` };
      }
      return await this.studentsMockAnswersModel.findAndCountAll({
        where,
        limit,
        offset,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching student mock answers:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findByMockQuestionAndUser(
    mockQuestionId: string,
    userId: string,
  ): Promise<StudentsMockAnswers | null> {
    try {
      return await this.studentsMockAnswersModel.findOne({
        where: { mockQuestionId, userId },
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching student mock answer by question and user:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findByLessonAndUserId(
    mockExamId: string,
    userId: string,
  ): Promise<{ count: number; rows: StudentsMockAnswers[] }> {
    try {
      return await this.studentsMockAnswersModel.findAndCountAll({
        where: { userId },
        include: [{ association: 'mockQuestion', where: { mockExamId } }],
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching student mock answers by mockExam ID:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findById(id: string): Promise<StudentsMockAnswers | null> {
    try {
      return await this.studentsMockAnswersModel.findByPk(id);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching student mock answer by ID:',
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
    updateData: Partial<StudentsMockAnswers>,
  ): Promise<StudentsMockAnswers | null> {
    try {
      const answer = await this.studentsMockAnswersModel.findByPk(id);

      if (!answer) {
        return null;
      }
      const mockQuestion = await this.mockQuestionService.findById(
        answer.mockQuestionId,
      );

      if (!mockQuestion) {
        throw new Error('Mock Question for the given Id Could not be found');
      }

      const score =
        mockQuestion.correctAnswer.toLowerCase() ===
          updateData.answer.toLowerCase() ||
        mockQuestion.correctAnswer === updateData.answer
          ? 1
          : 0;

      await answer.update({ ...updateData, score });

      // Compute and update exam record after answer update
      await this.computeAndUpdateExamRecord(
        answer.mockQuestionId,
        answer.userId,
      );

      return answer;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating student mock answer:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
  /**
   * Computes and updates the exam record for a user and mock exam after answer creation or update
   */
  private async computeAndUpdateExamRecord(
    mockQuestionId: string,
    userId: string,
  ): Promise<void> {
    // Get the mock question to find the mockExamId
    const mockQuestion =
      await this.studentsMockAnswersModel.sequelize.models.MockQuestions.findByPk(
        mockQuestionId,
      );
    if (!mockQuestion) return;
    // Use getDataValue to access property
    const mockExamId = mockQuestion.getDataValue('mockExamId');

    // Get all questions for the exam
    const allQuestions =
      await this.studentsMockAnswersModel.sequelize.models.MockQuestions.findAll(
        { where: { mockExamId } },
      );
    const totalQuestions = allQuestions.length;

    // Get all answers for this user and exam
    const allAnswers = await this.studentsMockAnswersModel.findAll({
      where: { userId },
      include: [{ association: 'mockQuestion', where: { mockExamId } }],
    });
    const totalAnsweredQuestions = allAnswers.length;
    const totalUnansweredQuestions = totalQuestions - totalAnsweredQuestions;

    // Compute correct/incorrect answers
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let obtainedMarks = 0;
    const totalMarks = totalQuestions; // assuming 1 mark per question
    for (const ans of allAnswers) {
      if (ans.answer === ans.mockQuestion.correctAnswer) {
        correctAnswers++;
        obtainedMarks++;
      } else {
        incorrectAnswers++;
      }
    }

    // Upsert exam record for the CURRENT week (matches the unique index
    // on mockExamId + userId + weekStart). `endedAt` is intentionally left
    // untouched here — it is only set when the attempt is completed, so the
    // XP-award guard in updateCompleted works.
    const weekStart = MockExamRecord.getIsoWeekStartDateOnly(new Date());
    const examRecordModel =
      this.studentsMockAnswersModel.sequelize.models.MockExamRecord;
    const [record] = await examRecordModel.findOrCreate({
      where: { mockExamId, userId, weekStart },
      defaults: {
        mockExamId,
        userId,
        weekStart,
        totalMarks,
        obtainedMarks,
        totalQuestions,
        totalAnsweredQuestions,
        totalUnansweredQuestions,
        correctAnswers,
        incorrectAnswers,
        startedAt: new Date().toISOString(),
      },
    });
    await record.update({
      totalMarks,
      obtainedMarks,
      totalQuestions,
      totalAnsweredQuestions,
      totalUnansweredQuestions,
      correctAnswers,
      incorrectAnswers,
    });
  }

  /** Removes every answer belonging to an exam record (used when restarting). */
  async deleteByExamRecord(mockExamRecordId: string): Promise<number> {
    try {
      return await this.studentsMockAnswersModel.destroy({
        where: { mockExamRecordId },
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error clearing answers for exam record:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const deletedCount = await this.studentsMockAnswersModel.destroy({
        where: { id },
      });
      return deletedCount > 0;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting student mock answer:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findByUserId(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<{ count: number; rows: StudentsMockAnswers[] }> {
    try {
      return await this.studentsMockAnswersModel.findAndCountAll({
        where: { userId },
        offset,
        limit,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching student mock answers by user ID:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
