import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateOptions, Op } from 'sequelize';
import stringify from "safe-stable-stringify";
import { State } from '../models/state.model';
import { City } from '../models/city.model';
import { CreateStateDto } from '../dto/create-state.dto';
import { UpdateStateDto } from '../dto/update-state.dto';

@Injectable()
export class StatesService {
  constructor(
    @InjectModel(State)
    private stateModel: typeof State,
    @InjectModel(City)
    private readonly cityModel: typeof City,
  ) {}

  async create(createStateDto: CreateStateDto, userId: string): Promise<State> {
    try {
      return await this.stateModel.create(createStateDto as any, { userId } as CreateOptions<any>);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating state',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  
  async findAll(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const { rows, count } = await this.stateModel.findAndCountAll({
    order: [['title', 'ASC']],
    limit,
    offset,
  });

  return {
    data: rows,
    meta: {
      total: count,
      page,
      lastPage: Math.ceil(count / limit),
    },
  };
}


  async findOne(id: string): Promise<State> {
    try {
      const state = await this.stateModel.findByPk(id);
      if (!state) {
        throw new NotFoundException(`State with ID ${id} not found`);
      }
      return state;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching state',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async update(id: string, updateStateDto: UpdateStateDto): Promise<State> {
    try {
      const state = await this.findOne(id);
      return await state.update(updateStateDto);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating state',
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
      const state = await this.findOne(id);
      await state.destroy();
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting state',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async createOneCity(title: string, stateId: string): Promise<City> {
    try {
      return await this.cityModel.create({ title, stateId });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating city',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async createManyCities(stateId: string, titles: string[]) {
    try {
      const records = titles.map((title) => ({ title, stateId }));
      return await this.cityModel.bulkCreate(records, { ignoreDuplicates: true });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error linking multiple states to user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async getCitiesByState(stateId: string): Promise<City[]> {
    try {
      return await this.cityModel.findAll({ where: { stateId } });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching cities for state',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async deleteOneCity(cityId: string): Promise<any> {
    try {
      return await this.cityModel.destroy({ where: { id: cityId } });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error unlinking state from user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
