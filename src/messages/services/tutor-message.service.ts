// src/messages/services/tutor-message.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TutorMessage } from '../models/tutor-message.model';
import { NotificationTracking } from 'src/notification-tracking/models/notification-recipient.model';
import { CreateTutorMessageDto } from '../dto/create-tutor-message.dto';
import { User } from 'src/user/models/user.model';
import { ClassEnrollment } from 'src/classes/models/class-enrollment.model';
import { NotificationEntityType } from 'src/shared-types/FileTypeEnum';
import { RoleEnum } from 'src/shared-types/RoleEnum';
import { Op } from 'sequelize';

@Injectable()
export class TutorMessageService {
  constructor(
    @InjectModel(TutorMessage) private messageModel: typeof TutorMessage,
    @InjectModel(NotificationTracking)
    private recipientModel: typeof NotificationTracking,
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(ClassEnrollment)
    private enrollmentModel: typeof ClassEnrollment,
  ) {}

  async create(dto: CreateTutorMessageDto, senderId: string) {
    // 1. Resolve the recipient students first so we never persist a message
    //    that reaches nobody.
    const recipientIds = await this.resolveRecipientIds(dto);

    if (!recipientIds.length) {
      throw new BadRequestException(
        'No students match the specified recipients/criteria',
      );
    }

    // 2. Store the message (with its targeting, for record/audit).
    const message = await this.messageModel.create({
      tutorId: senderId,
      title: dto.title,
      message: dto.message,
      sendToAll: !!dto.sendToAll,
      stateIds: dto.stateIds ?? null,
      subjectIds: dto.subjectIds ?? null,
      classIds: dto.classIds ?? null,
      studentIds: dto.studentIds ?? null,
    });

    // 3. Fan out to per-recipient notification rows (dedup on the unique
    //    entityType+entityId+userId index).
    const recipientRows = recipientIds.map((userId) => ({
      entityType: NotificationEntityType.TUTOR_MESSAGE,
      entityId: message.id,
      userId,
      read: false,
    }));

    await this.recipientModel.bulkCreate(recipientRows, {
      ignoreDuplicates: true,
    });

    return { ...message.toJSON(), recipientCount: recipientIds.length };
  }

  /**
   * Resolve the UNION of students matched by any of the provided targets.
   * `sendToAll` short-circuits to every student. All category lookups are
   * constrained to role=USER so tutors/admins are never messaged.
   */
  private async resolveRecipientIds(
    dto: CreateTutorMessageDto,
  ): Promise<string[]> {
    if (dto.sendToAll) {
      const all = await this.userModel.findAll({
        where: { role: RoleEnum.USER },
        attributes: ['id'],
      });
      return all.map((u) => u.id);
    }

    const ids = new Set<string>();

    // By state (User.stateId)
    if (dto.stateIds?.length) {
      const rows = await this.userModel.findAll({
        where: { role: RoleEnum.USER, stateId: { [Op.in]: dto.stateIds } },
        attributes: ['id'],
      });
      rows.forEach((r) => ids.add(r.id));
    }

    // By subject (users_subjects join via the `subjects` association)
    if (dto.subjectIds?.length) {
      const rows = await this.userModel.findAll({
        where: { role: RoleEnum.USER },
        attributes: ['id'],
        include: [
          {
            association: 'subjects',
            attributes: [],
            through: { attributes: [] },
            where: { id: { [Op.in]: dto.subjectIds } },
          },
        ],
      });
      rows.forEach((r) => ids.add(r.id));
    }

    // By class enrolled (class_enrollments), keeping only student accounts.
    if (dto.classIds?.length) {
      const enrollments = await this.enrollmentModel.findAll({
        where: { classId: { [Op.in]: dto.classIds } },
        attributes: ['userId'],
      });
      const enrolledIds = [...new Set(enrollments.map((e) => e.userId))];
      if (enrolledIds.length) {
        const rows = await this.userModel.findAll({
          where: { role: RoleEnum.USER, id: { [Op.in]: enrolledIds } },
          attributes: ['id'],
        });
        rows.forEach((r) => ids.add(r.id));
      }
    }

    // Individual students (User.id)
    if (dto.studentIds?.length) {
      const rows = await this.userModel.findAll({
        where: { role: RoleEnum.USER, id: { [Op.in]: dto.studentIds } },
        attributes: ['id'],
      });
      rows.forEach((r) => ids.add(r.id));
    }

    return [...ids];
  }
}
