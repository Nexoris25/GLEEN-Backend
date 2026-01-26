import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Complaint } from '../models/complaint.model';
import { CreateComplaintDto, UpdateComplaintDto } from '../dto/complaint.dto';
import { Op } from 'sequelize';

@Injectable()
export class ComplaintService {
  constructor(
    @InjectModel(Complaint)
    private complaintModel: typeof Complaint,
  ) {}

  async create(dto: CreateComplaintDto, userId: string) {
    try {
      const complaint: any = await this.complaintModel.create(
        { ...dto },
        { userId } as any
      );
      return complaint;
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to create complaint');
    }
  }

  async findAll(query: any): Promise<{ count: number; rows: Complaint[] }> {
    try {
      const { status, userId, search, limit = 10, offset = 0 } = query;

      const where: any = {};

      if (status) where.status = status;
      if (userId) where.userId = userId;
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { rows, count } = await this.complaintModel.findAndCountAll({
        where,
        include: { all: true },
        limit: Number(limit),
        offset: Number(offset),
        order: [['createdAt', 'DESC']],
      });
      return { count, rows };
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to fetch complaints');
    }
  }

  async findOne(id: string): Promise<Complaint> {
    try {
      const complaint = await this.complaintModel.findByPk(id, {
        include: { all: true },
      });
      if (!complaint) throw new NotFoundException('Complaint not found');
      return complaint;
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Error fetching complaint');
    }
  }

  async update(id: string, dto: UpdateComplaintDto): Promise<Complaint> {
    try {
      const complaint = await this.findOne(id);
      await complaint.update(dto);
      return complaint;
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to update complaint');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const complaint = await this.findOne(id);
      await complaint.destroy();
      return { message: 'Complaint deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to delete complaint');
    }
  }
}
