// src/metrics/metrics.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MetricsService } from './services/metrics.service';
import { MetricsController } from './controllers/metrics.controller';
import { User } from '../user/models/user.model';
import { ClassEntity } from '../classes/entities/class.entity';
import { ClassEnrollment } from '../classes/models/class-enrollment.model';
import { StudentsQuizAnswers } from '../lesson/models/students_quiz_answers';
import { ClassesModule } from '../classes/classes.module';
import { LessonModule } from '../lesson/lesson.module';
import { Subject } from 'src/subject/models/subject.model';
import { Room } from 'src/rooms/models/room.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      ClassEntity,
      ClassEnrollment,
      StudentsQuizAnswers,
      Subject,
      Room,
    ]),
    forwardRef(() => ClassesModule),
    forwardRef(() => LessonModule),
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
