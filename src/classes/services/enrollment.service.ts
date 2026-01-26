import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ClassEnrollment } from '../models/class-enrollment.model';
import { EnrollDto } from '../dto/enroll.dto';

import { ClassEntity } from '../entities/class.entity';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectModel(ClassEntity)
    private readonly classModel: typeof ClassEntity,
    @InjectModel(ClassEnrollment)
    private readonly enrollmentModel: typeof ClassEnrollment,

  ) {}

async enroll(userId: string, classId: string) {
  try { const cls = await this.classModel.findByPk(classId.trim());
    if (!cls) { return { success: false, message: 'Class not found' };     }
    const enrolled = cls.enrolledStudents ?? [];
    if (!enrolled.includes(userId)) {
      cls.enrolledStudents = [...enrolled, userId]; await cls.save(); }
    await cls.reload(); // optional but good for sanity
    return {
      success: true,
      message: 'Student enrolled',
      enrolledStudents: cls.enrolledStudents,
    };
  } catch (err) {
    return { success: false, message: 'Failed to enroll student' };
  }}

  async markAttendance(classId: string, studentId: string) {
    const enrollment = await this.enrollmentModel.findOne({
      where: { classId, studentId },
    });

    if (!enrollment) throw new NotFoundException('Enrollment record not found');

    if (!enrollment.attended) {
      enrollment.attended = true;
      await enrollment.save();
     // await this.XpRecordsService.updateByUserId(studentId, 10);
    }

    return { message: 'Attendance marked', attended: true };
  }
}
