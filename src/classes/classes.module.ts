import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClassesService } from './services/classes.service';
import { EnrollmentService } from './services/enrollment.service';
import { ClassesController } from './controllers/classes.controller';
import { EnrollmentController } from './controllers/enrollment.controller';
import { ClassEntity } from './entities/class.entity';
import { ClassEnrollment } from './models/class-enrollment.model';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ClassEntity, ClassEnrollment]), 
    UserModule,  // for user/tutor validation
  ],
  controllers: [
    ClassesController, 
    EnrollmentController
  ],
  providers: [
    ClassesService, 
    EnrollmentService
  ],
  exports: [
    ClassesService,  // export the service for other modules
  ],
})
export class ClassesModule {}
