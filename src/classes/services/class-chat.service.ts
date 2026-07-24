import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateOptions } from 'sequelize';
import stringify from 'safe-stable-stringify';
import { ClassChat } from '../models/class-chat.model';

@Injectable()
export class ClassChatService {
  constructor(
    @InjectModel(ClassChat)
    private readonly classChatModel: typeof ClassChat,
  ) {}

  async create(
    data: { classId: string; message: string },
    userId: string,
  ): Promise<ClassChat> {
    try {
      const chat = await this.classChatModel.create(
        { ...data, userId },
        { userId } as CreateOptions<ClassChat>,
      );
      // Reload with the sender so REST responses and realtime `newMessage`
      // events carry the author's name/avatar.
      return (
        (await this.classChatModel.findByPk(chat.id, {
          include: ['user'],
        })) ?? chat
      );
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating class chat',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(
    classId: string,
    offset?: number,
    limit?: number,
  ): Promise<{ rows: ClassChat[]; count: number }> {
    try {
      return await this.classChatModel.findAndCountAll({
        where: { classId },
        offset,
        limit,
        include: ['user'],
        order: [['createdAt', 'ASC']],
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching class chats',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
