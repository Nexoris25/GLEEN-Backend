// src/messages/services/tutor-message.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TutorMessage } from '../models/tutor-message.model';
import { NotificationTracking } from 'src/notification-tracking/models/notification-recipient.model';
import { CreateTutorMessageDto } from '../dto/create-tutor-message.dto';
import { User } from 'src/user/models/user.model';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TutorMessageService {
  constructor(
    @InjectModel(TutorMessage) private messageModel: typeof TutorMessage,
    @InjectModel(NotificationTracking)
    private recipientModel: typeof NotificationTracking,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async create(dto: CreateTutorMessageDto, tutorId: string) {
    // ----------------------------
    // 1. Validate that at least one target exists
    // ----------------------------
    const hasTarget =
      dto.studentId ||
      dto.sendToAll ||
      dto.stateId ||
      (dto.classIds && dto.classIds.length > 0) ||
      dto.subjectId;

    if (!hasTarget) {
      throw new BadRequestException(
        'You must provide at least one target: studentId, sendToAll, stateId, subjectId, or classIds',
      );
    }

    // ----------------------------
    // 2. Create the message
    // ----------------------------
    const message = await this.messageModel.create({
      ...dto,
      tutorId,
    });

    // ----------------------------
    // 3. Resolve recipients
    // ----------------------------
    const students = await this.resolveRecipients(dto);

    if (!students.length) {
      throw new BadRequestException(
        'No students match the specified filters/criteria',
      );
    }

    // ----------------------------
    // 4. Create notification / recipient rows
    // ----------------------------
    const recipientRows = students.map((student) => ({
      id: uuidv4(),
      entityType: 'TUTOR_MESSAGE', // Required column in notification_tracking
      entityId: message.id, // Link to the message
      userId: student.id, // Student receiving
      read: false,
      readAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await this.recipientModel.bulkCreate(recipientRows);

    return message;
  }

  private async resolveRecipients(dto: CreateTutorMessageDto) {
    // Start with all students
    const where: any = { role: 'USER' };

    if (!dto.sendToAll) {
      if (dto.stateId) where.stateId = dto.stateId;
      if (dto.subjectId) where.subjectId = dto.subjectId;
      if (dto.classIds?.length) {
        where.classId = { [Op.in]: dto.classIds };
      }
      if (dto.studentId) where.id = dto.studentId;
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
