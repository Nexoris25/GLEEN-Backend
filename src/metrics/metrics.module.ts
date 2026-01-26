// src/metrics/metrics.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MetricsService } from './services/metrics.service';
import { MetricsController } from './controllers/metrics.controller';
import { User } from '../user/models/user.model';
import { ClassEntity } from '../classes/entities/class.entity';
import { ClassEnrollment } from '../classes/models/class-enrollment.model';
import { StudentsQuizAnswers } from '../lesson/models/students_quiz_answers';
import { Room } from '../rooms/models/room.model';
import { ClassesModule } from '../classes/classes.module';
import { LessonModule } from '../lesson/lesson.module';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      ClassEntity,
      ClassEnrollment,
      StudentsQuizAnswers,
      Room,
    ]),
    forwardRef(() => ClassesModule),
    forwardRef(() => LessonModule),
    forwardRef(() => RoomsModule),
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
