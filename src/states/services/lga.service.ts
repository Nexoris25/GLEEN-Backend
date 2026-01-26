import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lga } from '../models/lga.model';
import { State } from '../../states/models/state.model';
import { CreateLgaDto } from '../dto/create-lga.dto';
import { UpdateLgaDto } from '../dto/update-lga.dto';

@Injectable()
export class LgaService {
  constructor(
    @InjectModel(Lga)
    private readonly lgaModel: typeof Lga,
    @InjectModel(State)
    private readonly stateModel: typeof State,
  ) {}

  // --------------------
  // Create LGA (Admin only)
  // --------------------
  async create(dto: CreateLgaDto): Promise<Lga> {
    const state = await this.stateModel.findByPk(dto.stateId);
    if (!state) {
      throw new NotFoundException(`State with id ${dto.stateId} not found`);
    }

    const [lga, created] = await this.lgaModel.findOrCreate({
      where: { title: dto.title, stateId: dto.stateId },
      defaults: dto,
    });

    return lga;
  }

  
  // --------------------
  // Find LGAs by state
  // --------------------
  async findByState(stateId: string, page = 1, limit = 10) {
    const state = await this.stateModel.findByPk(stateId);
    if (!state) {
      throw new NotFoundException(`State with id ${stateId} not found`);
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await this.lgaModel.findAndCountAll({
      where: { stateId },
      include: [State],
      limit,
      offset,
      order: [['title', 'ASC']],
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


  // --------------------
  // Find all LGAs (with pagination)
  // --------------------
  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.lgaModel.findAndCountAll({
      include: [State],
      limit,
      offset,
      order: [['title', 'ASC']],
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

  // --------------------
  // Find one LGA by ID
  // --------------------
  async findOne(id: string) {
    const lga = await this.lgaModel.findByPk(id, { include: [State] });
    if (!lga) throw new NotFoundException(`LGA with id ${id} not found`);
    return lga;
  }

  // --------------------
  // Update LGA (Admin only)
  // --------------------
  async update(id: string, dto: UpdateLgaDto) {
    const lga = await this.findOne(id);
    await lga.update(dto);
    return lga;
  }

  // --------------------
  // Delete LGA (Admin only)
  // --------------------
  async remove(id: string) {
    const lga = await this.findOne(id);
    await lga.destroy();
    return { message: 'LGA deleted successfully' };
  }
}
