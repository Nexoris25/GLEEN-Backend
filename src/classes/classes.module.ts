import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClassesService } from './services/classes.service';
import { ClassesController } from './controllers/classes.controller';
import { ClassEnrollment } from 'src/classes/models/class-enrollment.model';
import { ClassRecording } from './models/class-recording.model';
import { ClassEntity } from './entities/class.entity';
import { UserModule } from '../user/user.module';
import { Subject } from 'src/subject/models/subject.model';
import { Room } from 'src/rooms/models/room.model';
import { UserSubject } from 'src/subject/models/user-subject.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ClassEntity,
      ClassEnrollment,
      ClassRecording,
      Subject,
      Room,
      UserSubject,
    ]),
    UserModule, // for user/tutor validation
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [
    ClassesService, // export the service for other modules
  ],
})
export class ClassesModule {}
