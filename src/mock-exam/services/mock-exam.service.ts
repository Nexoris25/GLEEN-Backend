import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import stringify from 'safe-stable-stringify';
import { MockExams } from '../models/mock-exam.model';
import { CreateMockExamDto } from '../dtos/create-mock-exam.dto';
import { SearchMockExamDto } from '../dtos/search-mock-exam.dto';
import { UpdateMockExamDto } from '../dtos/udpdate-mock-exam.dto';
import { Op } from 'sequelize';
import { CreateMockExamCommentDto } from '../dtos/create-mock-exam-comment.dto';
import { MockExamComment } from '../models/mock-exam-comment.model';
import { UpdateMockExamCommentDto } from '../dtos/update-mock-exam-comment.dto';

@Injectable()
export class MockExamsService {
  constructor(
    @InjectModel(MockExams)
    private mockExamsModel: typeof MockExams,
    @InjectModel(MockExamComment)
    private mockExamCommentModel: typeof MockExamComment,
  ) {}

  async create(
    createDto: CreateMockExamDto,
    userId: string,
  ): Promise<MockExams> {
    try {
      const values = { ...createDto, userId };
      return await this.mockExamsModel.create(values as any, {
        isNewRecord: true,
        userId,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating mock exam:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(
    options: SearchMockExamDto,
  ): Promise<{ rows: MockExams[]; count: number }> {
    try {
      const { limit, offset, ...where } = options;
      const whereOptions: any = { ...where };
      if (options.userId) {
        whereOptions.userId = options.userId;
      }
      if (options.subjectId) {
        whereOptions.subjectId = options.subjectId;
      }
      if (options.mockTypeId) {
        whereOptions.mockTypeId = options.mockTypeId;
      }
      if (options.status) {
        whereOptions.status = options.status;
      }
      if (options.title) {
        whereOptions.title = { [Op.iLike]: `%${options.title}%` };
      }
      if (options.description) {
        whereOptions.description = { [Op.iLike]: `%${options.description}%` };
      }
      if (options.duration) {
        whereOptions.duration = { [Op.iLike]: `%${options.duration}%` };
      }
      return await this.mockExamsModel.findAndCountAll({
        where: whereOptions,
        limit,
        offset,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching mock exams:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findById(id: string): Promise<MockExams | null> {
    try {
      return await this.mockExamsModel.findByPk(id);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching mock exam by ID:',
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
    updateDto: UpdateMockExamDto,
  ): Promise<MockExams | null> {
    try {
      const exam = await this.mockExamsModel.findByPk(id);
      if (!exam) {
        throw new Error('Mock exam not found');
      }
      await exam.update(updateDto);
      return exam;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating mock exam:',
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
      const deletedCount = await this.mockExamsModel.destroy({ where: { id } });
      return deletedCount > 0;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting mock exam:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async createComment(
    createCommentDto: CreateMockExamCommentDto,
    userId: string,
  ): Promise<MockExamComment> {
    try {
      const comment = await this.mockExamCommentModel.create(
        { ...createCommentDto, userId },
        { isNewRecord: true, userId },
      );
      return comment;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating mockExam comment',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findCommentById(id: string): Promise<MockExamComment> {
    try {
      const comment = await this.mockExamCommentModel.findByPk(id);
      if (!comment) {
        throw new NotFoundException(`Comment with id ${id} not found`);
      }
      return comment;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error finding mockExam comment',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findCommentByMockExam(mockExamId: string): Promise<MockExamComment[]> {
    try {
      const comments = await this.mockExamCommentModel.findAll({
        where: { mockExamId },
      });
      return comments;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error finding mockExam comments',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findCommentByMockExamAndUser(
    mockExamId: string,
    userId: string,
  ): Promise<MockExamComment | null> {
    try {
      const comment = await this.mockExamCommentModel.findOne({
        where: { mockExamId, userId },
      });
      return comment;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error finding mockExam comment by mockExam and user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async updateComment(
    id: string,
    updateCommentDto: UpdateMockExamCommentDto,
  ): Promise<MockExamComment> {
    try {
      const comment = await this.findCommentById(id);
      Object.assign(comment, updateCommentDto);
      return await comment.save();
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating mockExam comment',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async removeComment(id: string): Promise<void> {
    try {
      const comment = await this.findCommentById(id);
      await comment.destroy();
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting mockExam comment',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
