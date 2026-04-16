import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Subject } from './models/subject.model';
import { SubjectController } from './controllers/subject.controller';
import { SubjectService } from './services/subject.service';
import { UserSubject } from './models/user-subject.model';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/user/models/user.model';
import { BunnyService } from 'src/common/services/bunny-all.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    SequelizeModule.forFeature([Subject, UserSubject, User]),
  ],
  providers: [SubjectService, BunnyService],
  controllers: [SubjectController],
  exports: [SubjectService],
})
export class SubjectModule {}
