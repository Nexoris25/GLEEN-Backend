// src/metrics/services/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { ClassEntity } from '../../classes/entities/class.entity';
import { StudentsQuizAnswers } from '../../lesson/models/students_quiz_answers';

@Injectable()
export class MetricsService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(ClassEntity) private readonly classModel: typeof ClassEntity,
    @InjectModel(StudentsQuizAnswers) private readonly studentsQuizModel: typeof StudentsQuizAnswers,
    private sequelize: Sequelize,
  ) {}

  async getMetrics() {
    // ✅ Total counts
    const totalUsers = await this.userModel.count();
    const totalClasses = await this.classModel.count();
    const totalQuizAnswers = await this.studentsQuizModel.count();

    return {
      totalUsers,
      totalClasses,
      totalQuizAnswers,
    };
  }
}
