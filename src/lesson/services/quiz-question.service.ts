import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QuizQuestions } from '../models/quiz_questions.model';
import {
  CreateBulkQuizQuestionDto,
  CreateQuizQuestionDto,
} from '../dto/create-quiz-question.dto';
import {
  UpdateBulkQuizQuestionDto,
  UpdateQuizQuestionDto,
} from '../dto/update-quiz-question.dto';
import { SearchQuizQuestionDto } from '../dto/search-quiz-question.dto';
import stringify from 'safe-stable-stringify';
import { Op } from 'sequelize';

@Injectable()
export class QuizQuestionsService {
  constructor(
    @InjectModel(QuizQuestions)
    private quizQuestionsModel: typeof QuizQuestions,
  ) {}

  async create(
    createDto: CreateQuizQuestionDto,
    userId: string,
  ): Promise<QuizQuestions> {
    try {
      return await this.quizQuestionsModel.create({
        ...createDto,
        userId,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating quiz question:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async createBulk(
    createBulkDto: CreateBulkQuizQuestionDto,
    quizId: string,
    userId: string,
  ): Promise<QuizQuestions[]> {
    try {
      const questionsData = createBulkDto.questions.map((question) => ({
        ...question,
        quizId,
        userId,
      }));
      return await this.quizQuestionsModel.bulkCreate(questionsData, {
        validate: true,
        individualHooks: true,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating quiz questions in bulk:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async updateBulk(
    updateBulkDto: UpdateBulkQuizQuestionDto,
    quizId: string,
  ): Promise<QuizQuestions[]> {
    try {
      const ids = updateBulkDto.questions.map((q) => q.id);

      const existingQuestions = await this.quizQuestionsModel.findAll({
        where: { id: { [Op.in]: ids }, quizId },
      });

      if (existingQuestions.length !== ids.length) {
        throw new Error(
          'One or more quiz questions were not found for the provided quizId',
        );
      }

      const byId = new Map(existingQuestions.map((q) => [q.id, q]));

      const updatedQuestions = await Promise.all(
        updateBulkDto.questions.map(async ({ id, ...payload }) => {
          const question = byId.get(id);
          if (!question) {
            throw new Error(
              'One or more quiz questions were not found for the provided quizId',
            );
          }
          await question.update(payload);
          return question;
        }),
      );

      return updatedQuestions;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating quiz questions in bulk:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(
    options: SearchQuizQuestionDto,
  ): Promise<{ rows: QuizQuestions[]; count: number }> {
    try {
      const { limit, offset, ...where } = options;
      const whereOptions: any = { ...where };
      if (options.userId) {
        whereOptions.userId = options.userId;
      }
      if (options.quizId) {
        whereOptions.quizId = options.quizId;
      }
      if (options.question) {
        whereOptions.question = { [Op.iLike]: `%${options.question}%` };
      }
      if (options.type) {
        whereOptions.type = options.type;
      }
      return await this.quizQuestionsModel.findAndCountAll({
        where: whereOptions,
        limit,
        offset,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching quiz questions:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findById(id: string): Promise<QuizQuestions | null> {
    try {
      return await this.quizQuestionsModel.findByPk(id);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching quiz question by ID:',
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
    updateDto: UpdateQuizQuestionDto,
  ): Promise<QuizQuestions | null> {
    try {
      const question = await this.quizQuestionsModel.findByPk(id);
      if (!question) {
        throw new Error('Quiz question not found');
      }
      await question.update(updateDto);
      return question;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating quiz question:',
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
      const deletedCount = await this.quizQuestionsModel.destroy({
        where: { id },
      });
      return deletedCount > 0;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting quiz question:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
