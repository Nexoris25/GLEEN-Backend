import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QuizQuestions } from '../models/quiz_questions.model';
import { CreateQuizQuestionDto } from '../dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from '../dto/update-quiz-question.dto';
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
      } as any);
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
