import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LessonService } from './services/lesson.service';
import { LessonController } from './controllers/lesson.controller';
import { LessonTracking } from './models/lesson_tracking.model';
import { LessonComment } from './models/lesson_comment.model';
import { StudentsQuizAnswers } from './models/students_quiz_answers';
import { QuizQuestions } from './models/quiz_questions.model';
import { QuizQuestionsService } from './services/quiz-question.service';
import { StudentsQuizAnswersService } from './services/student-quiz-answer.service';
import { QuizQuestionController } from './controllers/quiz-question.controller';
import { StudentQuizAnswerController } from './controllers/student-quiz-answer.controller';
import { BunnyService } from 'src/common/services/bunny-all.service';
import { Quizzes } from './models/quiz.model';
import { QuizzesService } from './services/quiz.service';
import { QuizController } from './controllers/quiz.controller';
import { QuizComment } from './models/quiz_comment.model';
import { LessonTopic } from './models/lesson_topic.model';
import { Lesson } from './models/lesson.model';
import { LessonTopicService } from './services/lesson-topic.service';
import { LessonTopicController } from './controllers/lesson-topic.controller';
import { QuizRecord } from './models/quiz-record.model';
import { QuizRecordService } from './services/quiz-record.service';
import { QuizRecordController } from './controllers/quiz-record.controller';
import { JwtModule } from '@nestjs/jwt';
import { XpModule } from 'src/xp/xp.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    SequelizeModule.forFeature([
      Lesson,
      LessonComment,
      LessonTracking,
      Quizzes,
      QuizComment,
      StudentsQuizAnswers,
      QuizQuestions,
      LessonTopic,
      QuizRecord,
    ]),
    forwardRef(() => XpModule),
  ],
  providers: [
    LessonService,
    QuizQuestionsService,
    StudentsQuizAnswersService,
    QuizzesService,
    LessonTopicService,
    BunnyService,
    QuizRecordService,
  ],
  controllers: [
    LessonController,
    QuizQuestionController,
    StudentQuizAnswerController,
    QuizController,
    LessonTopicController,
    QuizRecordController,
  ],
  exports: [
    SequelizeModule,
    LessonService,
    QuizQuestionsService,
    StudentsQuizAnswersService,
    QuizzesService,
    LessonTopicService,
    QuizRecordService,
  ],
})
export class LessonModule {}
