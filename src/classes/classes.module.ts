import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClassesService } from './services/classes.service';
import { ClassesController } from './controllers/classes.controller';
import { ClassEnrollment } from 'src/classes/models/class-enrollment.model';
import { ClassEntity } from './entities/class.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ClassEntity, 
    ClassEnrollment,]), 
    UserModule,  // for user/tutor validation
  ],
  controllers: [
    ClassesController
  ],
  providers: [
    ClassesService
  ],
  exports: [
    ClassesService,  // export the service for other modules
  ],
})
export class ClassesModule {}
