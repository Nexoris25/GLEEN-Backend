import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Faq } from '../models/faq.model';
import { CreateFaqDto } from '../dto/create-faq.dto';
import { UpdateFaqDto } from '../dto/update-faq.dto';
import stringify from 'safe-stable-stringify';

@Injectable()
export class FaqService {
  constructor(@InjectModel(Faq) private readonly faqModel: typeof Faq) {}

  async create(createDto: CreateFaqDto): Promise<Faq> {
    try {
      return await this.faqModel.create(createDto);
    } catch (err) {
      throw new BadRequestException({
        message: 'Error creating FAQ',
        details: stringify(err),
      });
    }
  }

  async findAll(): Promise<Faq[]> {
    return this.faqModel.findAll();
  }

  async findOne(id: string): Promise<Faq> {
    const faq = await this.faqModel.findByPk(id);
    if (!faq) throw new NotFoundException(`FAQ with id ${id} not found`);
    return faq;
  }

  async update(id: string, updateDto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.findOne(id);
    try {
      return await faq.update(updateDto as any);
    } catch (err) {
      throw new BadRequestException({
        message: 'Error updating FAQ',
        details: stringify(err),
      });
    }
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.faqModel.destroy({ where: { id } });
    if (!deleted) throw new NotFoundException(`FAQ with id ${id} not found`);
  }
}
