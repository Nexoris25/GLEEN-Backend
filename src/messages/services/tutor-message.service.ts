// src/messages/services/tutor-message.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TutorMessage } from '../models/tutor-message.model';
import { NotificationTracking } from 'src/notification-tracking/models/notification-recipient.model';
import { CreateTutorMessageDto } from '../dto/create-tutor-message.dto';
import { User } from 'src/user/models/user.model';
import { Op } from 'sequelize';

@Injectable()
export class TutorMessageService {
  constructor(
    @InjectModel(TutorMessage) private messageModel: typeof TutorMessage,
    @InjectModel(NotificationTracking) private recipientModel: typeof NotificationTracking,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async create(dto: CreateTutorMessageDto, tutorId: string) {
    const message = await this.messageModel.create({
      ...dto,
      tutorId,
    });

    const students = await this.resolveRecipients(dto);

    const recipientRows = students.map((student) => ({
      messageId: message.id,
      studentId: student.id,
    }));

    await this.recipientModel.bulkCreate(recipientRows);

    return message;
  }

  private async resolveRecipients(dto: CreateTutorMessageDto) {
    const where: any = { role: 'STUDENT' };

    if (!dto.sendToAll) {
      if (dto.state) where.state = dto.state;
      if (dto.subjectId) where.subjectId = dto.subjectId;
      if (dto.classIds?.length) {
        where.classId = { [Op.in]: dto.classIds };
      }
    }

    return this.userModel.findAll({ where });
  }

  async getStudentMessages(studentId: string) {
    return this.recipientModel.findAll({
      where: { studentId },
      include: [TutorMessage],
      order: [['createdAt', 'DESC']],
    });
  }

  async markAsRead(messageId: string, studentId: string) {
    return this.recipientModel.update(
      { read: true },
      { where: { messageId, studentId } },
    );
  }
}
