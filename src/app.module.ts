import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import config from './config';
import { Sequelize } from 'sequelize-typescript';
import { JwtModule } from '@nestjs/jwt';

// User & Auth
import { User } from './user/models/user.model';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PasswordResetOtp } from './auth/models/password-reset-otp.model';
import { EmailVerificationOtp } from './auth/models/email-verification-otp.model';
import { DailyLoginRecord } from './auth/models/daily-login-record.model';
import { DailyUserActivities } from './auth/models/daily-user-activities.model';

//validators
import { StateExistsConstraint } from 'src/common/validators/IsStateExists'; // your file

// Email
import { MailModule } from './email/email.module';
import { SeedModule } from './seeds/seed.module';

// Subjects & Goals
import { SubjectModule } from './subject/subject.module';
import { Subject } from './subject/models/subject.model';
import { UserSubject } from './subject/models/user-subject.model';
import { GoalModule } from './goal/goal.module';
import { Goal } from './goal/models/goal.model';
import { UserGoal } from './goal/models/user-goal.model';

// Lessons & Quizzes
import { LessonModule } from './lesson/lesson.module';
import { Lesson } from './lesson/models/lesson.model';
import { LessonComment } from './lesson/models/lesson_comment.model';
import { LessonTracking } from './lesson/models/lesson_tracking.model';
import { StudentsQuizAnswers } from './lesson/models/students_quiz_answers';
import { QuizQuestions } from './lesson/models/quiz_questions.model';
import { Quizzes } from './lesson/models/quiz.model';
import { QuizComment } from './lesson/models/quiz_comment.model';
import { LessonTopic } from './lesson/models/lesson_topic.model';
import { QuizRecord } from './lesson/models/quiz-record.model';

// Classes and Rooms (new)
import { ClassesModule } from './classes/classes.module';
//import { Classes } from './classes/models/classes.model';
import { ClassEntity } from './classes/entities/class.entity';
import { ClassEnrollment } from './classes/models/class-enrollment.model';
import { ClassRecording } from './classes/models/class-recording.model';
import { RoomsModule } from './rooms/rooms.module';
import { Room } from './rooms/models/room.model';

// Mock Exams
import { MockExamModule } from './mock-exam/mock-exam.module';
import { MockTypes } from './mock-exam/models/mock-type.model';
import { MockExams } from './mock-exam/models/mock-exam.model';
import { MockQuestions } from './mock-exam/models/mock-questions.model';
import { StudentsMockAnswers } from './mock-exam/models/students-mock-answers.model';
import { MockExamComment } from './mock-exam/models/mock-exam-comment.model';
import { MockExamRecord } from './mock-exam/models/mock-exam-record.model';

// States
import { StatesModule } from './states/state.module';
import { State } from './states/models/state.model';
import { City } from './states/models/city.model';
import { LgaModule } from './states/lga.module';
import { Lga } from './states/models/lga.model';

// Study Crew
import { StudyCrewModule } from './study-crew/study-crew.module';
import { Group } from './study-crew/models/group.model';
import { UserGroup } from './study-crew/models/user-group.model';
import { GroupChat } from './study-crew/models/group-chats.model';

// V1 Battles
import { V1BattleModule } from './v1-battle/v1-battle.module';
import { V1Battle } from './v1-battle/models/v1-battle.model';
import { V1BattleRecord } from './v1-battle/models/v1-battle-record.model';
import { V1BattleQuestionAnswers } from './v1-battle/models/v1-battle-question-answers.model';

// Subscriptions & Payments
import { SubscriptionModule } from './subscription/subscription.module';
import { Subscription } from './subscription/models/Subscription.model';
import { SubscriptionTransaction } from './subscription/models/subscription-transaction.model';
//import { PaymentGatewayNotificationsModule } from './payment-gateway-notifications/payment-gateway-notifications.module';
import { PaystackNotifications } from './payment-gateway-notifications/models/paystack-notification.model';
import { PaystackTransferRecipients } from './payment-gateway-notifications/models/paystack-transfer-recipients';
import { PaystackModule } from './payment-gateway-notifications/paystack.module';

// FAQ & Support
import { FaqModule } from './faq/faq.module';
import { Faq } from './faq/models/faq.model';
import { SupportModule } from './support/support.module';
import { Complaint } from './support/models/complaint.model';
import { ComplaintComment } from './support/models/complaint-comment.model';

// Notifications
import { NotificationModule } from './notification/notification.module';
import { NotificationSettings } from './notification/models/notification-settings.model';
import { NotificationTrackingModule } from './notification-tracking/notification-tracking.module';
//import { NotificationTracking } from './notification-tracking/models/notification-recipient.model';
import { TutorMessageModule } from './messages/tutor-message.module';

// XP
import { XpModule } from './xp/xp.module';
import { XpConfiguration } from './xp/models/xp-configuration.model';
import { XpLog } from './xp/models/xp-log.model';
import { XpRecords } from './xp/models/xp-record.model';
import { XpWithdrawalModule } from './xp-withdrawal/xp-withdrawal.module';
import { PushModule } from './push/push.module';
import { MetricsModule } from './metrics/metrics.module';
import { UploadModule } from './upload/upload.module';
import { CountriesModule } from './countries/countries.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    SequelizeModule.forRoot({
      ...config,
      models: [
        // Users & Auth
        User,
        PasswordResetOtp,
        EmailVerificationOtp,
        DailyLoginRecord,
        DailyUserActivities,
        // Subjects & Goals
        Subject,
        UserSubject,
        Goal,
        UserGoal,
        // Lessons & Quizzes
        Lesson,
        LessonComment,
        LessonTracking,
        StudentsQuizAnswers,
        QuizQuestions,
        Quizzes,
        QuizComment,
        LessonTopic,
        QuizRecord,
        // Classes & Rooms (new)
        ClassEntity,
        ClassEnrollment,
        Room,
        ClassRecording,
        // Mock Exams
        MockTypes,
        MockExams,
        MockQuestions,
        StudentsMockAnswers,
        MockExamComment,
        MockExamRecord,
        // States
        State,
        City,
        Lga,
        // Study Crew
        Group,
        UserGroup,
        GroupChat,
        // V1 Battles
        V1Battle,
        V1BattleRecord,
        V1BattleQuestionAnswers,
        // Subscriptions & Payments
        Subscription,
        SubscriptionTransaction,
        PaystackNotifications,
        PaystackTransferRecipients,
        // FAQ & Support
        Faq,
        Complaint,
        ComplaintComment,
        // Notifications
        NotificationSettings,
        // XP
        XpConfiguration,
        XpLog,
        XpRecords,
      ],
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      autoLoadModels: true, // true for dev and production. false for debug
      synchronize: true, // temporary set to true for initial run so to create tables
      logging: false, // temporary set to true for debugging
    }),
    // Modules
    AuthModule,
    SeedModule,
    UserModule,
    MailModule,
    SubjectModule,
    GoalModule,
    LessonModule,
    ClassesModule,
    RoomsModule,
    LgaModule,
    MockExamModule,
    StatesModule,
    StudyCrewModule,
    V1BattleModule,
    FaqModule,
    SubscriptionModule,
    PaystackModule,
    NotificationModule,
    SupportModule,
    XpModule,
    XpWithdrawalModule,
    PushModule,
    MetricsModule,
    CountriesModule,
    NotificationTrackingModule,
    TutorMessageModule,
    UploadModule,
  ],
  controllers: [],
  providers: [StateExistsConstraint],
})
export class AppModule implements OnModuleInit {
  constructor(private sequelize: Sequelize) {}

  async onModuleInit() {
    console.log('Module initialized successfully');

    // ✅ Only for first run / dev environment
    //await this.sequelize.sync({ force: true });
    // console.log('Database tables created fresh!');
  }
}
