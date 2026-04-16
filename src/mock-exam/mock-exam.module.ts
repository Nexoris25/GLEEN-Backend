import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MockTypes } from './models/mock-type.model';
import { MockExams } from './models/mock-exam.model';
import { MockQuestions } from './models/mock-questions.model';
import { StudentsMockAnswers } from './models/students-mock-answers.model';
import { MockTypesService } from './services/mock-type.service';
import { MockExamsService } from './services/mock-exam.service';
import { MockQuestionsService } from './services/mock-questions.service';
import { StudentsMockAnswersService } from './services/student-mock-answers.service';
import { MockExamController } from './controllers/mock-exam.controller';
import { MockTypeController } from './controllers/mock-type.controller';
import { MockQuestionController } from './controllers/mock-questions.controller';
import { StudentMockAnswerController } from './controllers/students-mock-answers.controller';
import { MockExamComment } from './models/mock-exam-comment.model';
import { MockExamRecord } from './models/mock-exam-record.model';
import { MockExamRecordService } from './services/mock-exam-record.service';
import { MockExamRecordController } from './controllers/mock-exam-record.controller';
import { JwtModule } from '@nestjs/jwt';
import { XpModule } from 'src/xp/xp.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    SequelizeModule.forFeature([
      MockTypes,
      MockExams,
      MockExamComment,
      MockQuestions,
      StudentsMockAnswers,
      MockExamRecord,
    ]),
    forwardRef(() => XpModule),
  ],
  providers: [
    MockTypesService,
    MockExamsService,
    MockQuestionsService,
    StudentsMockAnswersService,
    MockExamRecordService,
  ],
  controllers: [
    MockExamController,
    MockTypeController,
    MockQuestionController,
    StudentMockAnswerController,
    MockExamRecordController,
  ],
  exports: [
    MockTypesService,
    MockExamsService,
    MockQuestionsService,
    StudentsMockAnswersService,
    MockExamRecordService,
  ],
})
export class MockExamModule {}
