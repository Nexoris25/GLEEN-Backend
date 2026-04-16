import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import stringify from 'safe-stable-stringify';
import { Op } from 'sequelize';
import { MockTypes } from '../models/mock-type.model';
import { CreateMockTypeDto } from '../dtos/create-mock-type.dto';
import { SearchMockTypeDto } from '../dtos/search-mock-type.dto';
import { UpdateMockTypeDto } from '../dtos/udpdate-mock-type.dto';

@Injectable()
export class MockTypesService {
  constructor(
    @InjectModel(MockTypes)
    private mockTypesModel: typeof MockTypes,
  ) {}

  async create(
    createDto: CreateMockTypeDto,
    userId: string,
  ): Promise<MockTypes> {
    try {
      return await this.mockTypesModel.create(
        createDto as Omit<MockTypes, 'id'>,
        { isNewRecord: true, userId },
      );
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating mock type:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(
    options: SearchMockTypeDto,
  ): Promise<{ rows: MockTypes[]; count: number }> {
    try {
      const { limit, offset, ...where } = options;
      const whereOptions: any = { ...where };
      if (options.userId) {
        whereOptions.userId = options.userId;
      }
      if (options.title) {
        whereOptions.title = { [Op.iLike]: `%${options.title}%` };
      }
      if (options.description) {
        whereOptions.description = { [Op.iLike]: `%${options.description}%` };
      }
      return await this.mockTypesModel.findAndCountAll({
        where: whereOptions,
        limit,
        offset,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching mock types:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findById(id: string): Promise<MockTypes | null> {
    try {
      return await this.mockTypesModel.findByPk(id);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching mock type by ID:',
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
    updateDto: UpdateMockTypeDto,
  ): Promise<MockTypes | null> {
    try {
      const type = await this.mockTypesModel.findByPk(id);
      if (!type) {
        throw new Error('Mock type not found');
      }
      await type.update(updateDto);
      return type;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating mock type:',
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
      const deletedCount = await this.mockTypesModel.destroy({ where: { id } });
      return deletedCount > 0;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting mock type:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
