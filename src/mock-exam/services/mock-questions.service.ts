import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import stringify from 'safe-stable-stringify';
import { MockQuestions } from '../models/mock-questions.model';
import {
  CreateBulkMockQuestionDto,
  CreateMockQuestionDto,
} from '../dtos/create-mock-questions.dto';
import { SearchMockQuestionDto } from '../dtos/search-mock-question.dto';
import { UpdateMockQuestionDto } from '../dtos/udpdate-mock-questions.dto';
import { Op } from 'sequelize';

@Injectable()
export class MockQuestionsService {
  constructor(
    @InjectModel(MockQuestions)
    private mockQuestionsModel: typeof MockQuestions,
  ) {}

  async create(
    createDto: CreateMockQuestionDto,
    userId: string,
  ): Promise<MockQuestions> {
    try {
      return await this.mockQuestionsModel.create(
        createDto as Omit<MockQuestions, 'id'>,
        { isNewRecord: true, userId },
      );
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating mock question:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async createBulk(
    createBulkDto: CreateBulkMockQuestionDto,
    mockExamId: string,
    userId: string,
  ): Promise<MockQuestions[]> {
    try {
      const questionsData = createBulkDto.questions.map((question) => ({
        ...question,
        mockExamId,
        userId,
      }));
      return await this.mockQuestionsModel.bulkCreate(questionsData, {
        validate: true,
        individualHooks: true,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating mock questions in bulk:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(
    options: SearchMockQuestionDto,
  ): Promise<{ rows: MockQuestions[]; count: number }> {
    try {
      const { limit, offset, ...where } = options;
      const whereOptions: any = { ...where };
      if (options.userId) {
        whereOptions.userId = options.userId;
      }
      if (options.mockExamId) {
        whereOptions.mockExamId = options.mockExamId;
      }
      if (options.question) {
        whereOptions.question = { [Op.iLike]: `%${options.question}%` };
      }
      if (options.type) {
        whereOptions.type = options.type;
      }
      return await this.mockQuestionsModel.findAndCountAll({
        where: whereOptions,
        limit,
        offset,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching mock questions:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findById(id: string): Promise<MockQuestions | null> {
    try {
      return await this.mockQuestionsModel.findByPk(id);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching mock question by ID:',
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
    updateDto: UpdateMockQuestionDto,
  ): Promise<MockQuestions | null> {
    try {
      const question = await this.mockQuestionsModel.findByPk(id);
      if (!question) {
        throw new Error('Mock question not found');
      }
      await question.update(updateDto);
      return question;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating mock question:',
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
      const deletedCount = await this.mockQuestionsModel.destroy({
        where: { id },
      });
      return deletedCount > 0;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting mock question:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
