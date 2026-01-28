// src/metrics/services/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { ClassEntity } from '../../classes/entities/class.entity';
import { ClassEnrollment } from '../../classes/models/class-enrollment.model';
import { StudentsQuizAnswers } from '../../lesson/models/students_quiz_answers';

@Injectable()
export class MetricsService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(ClassEntity) private readonly classModel: typeof ClassEntity,
    @InjectModel(ClassEnrollment) private readonly classEnrollmentModel: typeof ClassEnrollment,
    @InjectModel(StudentsQuizAnswers) private readonly studentsQuizModel: typeof StudentsQuizAnswers,
    private sequelize: Sequelize,
  ) {}

  async getMetrics() {
    // ✅ Total counts
    const totalUsers = await this.userModel.count();
    const totalClasses = await this.classModel.count();
    const totalEnrollments = await this.classEnrollmentModel.count();
    const totalQuizAnswers = await this.studentsQuizModel.count();
    const totalAttendedEnrollments = await this.classEnrollmentModel.count({
      where: { attended: true },
    });

    // ✅ Top class by enrollment
    const topClass = await this.classEnrollmentModel.findAll({
      attributes: [
        'classId',
        [this.sequelize.fn('COUNT', this.sequelize.col('ClassEnrollment.id')), 'enrollmentCount'],
      ],
      include: [
        {
          model: ClassEntity,
          as: 'class',
          attributes: ['id', 'title'],
        },
      ],
      group: ['classId', 'class.id', 'class.title'],
      order: [[this.sequelize.literal('"enrollmentCount"'), 'DESC']],
      limit: 1,
    });

    return {
      totalUsers,
      totalClasses,
      totalEnrollments,
      totalQuizAnswers,
      totalAttendedEnrollments,
      topClass: topClass[0] || null,
    };
  }
}
