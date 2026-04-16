import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ComplaintComment } from '../models/complaint-comment.model';
import {
  CreateComplaintCommentDto,
  UpdateComplaintCommentDto,
} from '../dto/complaint-comment.dto';

@Injectable()
export class ComplaintCommentService {
  constructor(
    @InjectModel(ComplaintComment)
    private commentModel: typeof ComplaintComment,
  ) {}

  async create(dto: CreateComplaintCommentDto, userId: string) {
    try {
      const comment = await this.commentModel.create({ ...dto }, {
        userId,
      } as any);
      return comment;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to create comment',
      );
    }
  }

  async findAll(
    query: any,
  ): Promise<{ data: ComplaintComment[]; total: number }> {
    try {
      const { complaintId, userId, search, limit = 10, offset = 0 } = query;

      const where: any = {};
      if (complaintId) where.complaintId = complaintId;
      if (userId) where.userId = userId;
      if (search) {
        where.comment = { [Op.iLike]: `%${search}%` };
      }

      const { rows, count } = await this.commentModel.findAndCountAll({
        where,
        limit: Number(limit),
        offset: Number(offset),
        order: [['createdAt', 'DESC']],
      });

      return { data: rows, total: count };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to fetch comments',
      );
    }
  }

  async findOne(id: string): Promise<ComplaintComment> {
    try {
      const comment = await this.commentModel.findByPk(id);
      if (!comment) throw new NotFoundException('Comment not found');
      return comment;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Error fetching comment',
      );
    }
  }

  async update(
    id: string,
    dto: UpdateComplaintCommentDto,
  ): Promise<ComplaintComment> {
    try {
      const comment = await this.findOne(id);
      await comment.update(dto);
      return comment;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to update comment',
      );
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const comment = await this.findOne(id);
      await comment.destroy();
      return { message: 'Comment deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to delete comment',
      );
    }
  }
}
