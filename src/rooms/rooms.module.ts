import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoomsService } from './services/rooms.service';
import { RoomsController } from './controllers/rooms.controller';
import { Room } from './models/room.model';
import { ClassEntity } from 'src/classes/entities/class.entity';
import { Subject } from 'src/subject/models/subject.model';

@Module({
  imports: [SequelizeModule.forFeature([Room, ClassEntity, Subject])],
  providers: [RoomsService],
  controllers: [RoomsController],
  exports: [RoomsService],
})
export class RoomsModule {}
