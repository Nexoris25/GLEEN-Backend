import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Faq } from 'src/faq/models/faq.model';
import { Goal } from 'src/goal/models/goal.model';
import { Lesson } from 'src/lesson/models/lesson.model';
import { LessonComment } from 'src/lesson/models/lesson_comment.model';
import { LessonTopic } from 'src/lesson/models/lesson_topic.model';
import { LessonTracking } from 'src/lesson/models/lesson_tracking.model';
import { QuizRecord } from 'src/lesson/models/quiz-record.model';
import { Quizzes } from 'src/lesson/models/quiz.model';
import { QuizComment } from 'src/lesson/models/quiz_comment.model';
import { QuizQuestions } from 'src/lesson/models/quiz_questions.model';
import { StudentsQuizAnswers } from 'src/lesson/models/students_quiz_answers';
import { MockExamComment } from 'src/mock-exam/models/mock-exam-comment.model';
import { MockExamRecord } from 'src/mock-exam/models/mock-exam-record.model';
import { MockExams } from 'src/mock-exam/models/mock-exam.model';
import { MockQuestions } from 'src/mock-exam/models/mock-questions.model';
import { MockTypes } from 'src/mock-exam/models/mock-type.model';
import { StudentsMockAnswers } from 'src/mock-exam/models/students-mock-answers.model';
import { City } from 'src/states/models/city.model';
import { State } from 'src/states/models/state.model';
import { GroupChat } from 'src/study-crew/models/group-chats.model';
import { Group } from 'src/study-crew/models/group.model';
import { Subject } from 'src/subject/models/subject.model';
import { UserSubject } from 'src/subject/models/user-subject.model';
import { SubscriptionTransaction } from 'src/subscription/models/subscription-transaction.model';
import { Subscription } from 'src/subscription/models/Subscription.model';
import { User } from 'src/user/models/user.model';
import { V1BattleQuestionAnswers } from 'src/v1-battle/models/v1-battle-question-answers.model';
import { V1BattleRecord } from 'src/v1-battle/models/v1-battle-record.model';
import { V1Battle } from 'src/v1-battle/models/v1-battle.model';

// response.dto.ts
export class ResponseDto<T> {
  @ApiProperty()
  status: number;

  data?: T | T[];

  @ApiPropertyOptional()
  error?: string;

  @ApiPropertyOptional()
  message?: string;
}

export class PResponseDto<T> {
  @ApiProperty()
  count: number;

  @ApiProperty()
  rows: T[];
}

export class PaginationResponseDto<T> {
  @ApiProperty()
  status: number;

  data?: PResponseDto<T>;

  @ApiPropertyOptional()
  error?: string;

  @ApiPropertyOptional()
  message?: string;
}

export class UserResponseDto extends ResponseDto<User> {
  // @ApiProperty({ type: () => User })
  data?: User;
}

export class UserArrayResponseDto extends ResponseDto<User> {
  // @ApiProperty({ type: () => User, isArray: true })
  data?: any[];
}

export class GoalResponseDto extends ResponseDto<Goal> {
  @ApiProperty({ type: () => Goal })
  data?: Goal;
}

export class GoalArrayResponseDto extends ResponseDto<Goal> {
  @ApiProperty({ type: () => Goal, isArray: true })
  data?: Goal[];
}

export class SubjectResponseDto extends ResponseDto<Subject> {
  @ApiProperty({ type: () => Subject })
  data?: Subject;
}

export class SubjectArrayResponseDto extends ResponseDto<Subject> {
  @ApiProperty({ type: () => Subject, isArray: true })
  data?: Subject[];
}

export class SubjectArrayResponseCountDto extends ResponseDto<
  PResponseDto<Subject>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<Subject> })
  data?: PResponseDto<Subject>;
}

export class LessonResponseDto extends ResponseDto<Lesson> {
  @ApiProperty({ type: () => Lesson })
  data?: Lesson;
}

export class LessonArrayResponseDto extends ResponseDto<Lesson> {
  @ApiProperty({ type: () => Lesson, isArray: true })
  data?: Lesson[];
}

export class LessonArrayResponseCountDto extends ResponseDto<
  PResponseDto<Lesson>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<Lesson> })
  data?: PResponseDto<Lesson>;
}

export class StateResponseDto extends ResponseDto<State> {
  @ApiProperty({ type: () => State })
  data?: State;
}

export class StateArrayResponseDto extends ResponseDto<State> {
  @ApiProperty({ type: () => State, isArray: true })
  data?: State[];
}

export class StateArrayResponseCountDto extends ResponseDto<
  PResponseDto<State>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<State> })
  data?: PResponseDto<State>;
}

export class CityResponseDto extends ResponseDto<City> {
  @ApiProperty({ type: () => City })
  data?: City;
}

export class CityArrayResponseDto extends ResponseDto<City> {
  @ApiProperty({ type: () => City, isArray: true })
  data?: City[];
}

export class CityArrayResponseCountDto extends ResponseDto<PResponseDto<City>> {
  @ApiPropertyOptional({ type: () => PResponseDto<City> })
  data?: PResponseDto<City>;
}

export class FaqResponseDto extends ResponseDto<Faq> {
  @ApiProperty({ type: () => Faq })
  data?: Faq;
}
export class FaqResponseCountDto extends ResponseDto<PResponseDto<Faq>> {
  @ApiPropertyOptional({ type: () => PResponseDto<Faq> })
  data?: PResponseDto<Faq>;
}

export class FaqArrayResponseDto extends ResponseDto<Faq> {
  @ApiProperty({ type: () => Faq, isArray: true })
  data?: Faq[];
}

export class LessonTopicResponseDto extends ResponseDto<LessonTopic> {
  @ApiProperty({ type: () => LessonTopic })
  data?: LessonTopic;
}
export class LessonTopicResponseCountDto extends ResponseDto<
  PResponseDto<LessonTopic>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<LessonTopic> })
  data?: PResponseDto<LessonTopic>;
}

export class LessonTopicArrayResponseDto extends ResponseDto<LessonTopic> {
  @ApiProperty({ type: () => LessonTopic, isArray: true })
  data?: LessonTopic[];
}

export class MockExamRecordResponseDto extends ResponseDto<MockExamRecord> {
  @ApiProperty({ type: () => MockExamRecord })
  data?: MockExamRecord;
}
export class MockExamRecordResponseCountDto extends ResponseDto<
  PResponseDto<MockExamRecord>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<MockExamRecord> })
  data?: PResponseDto<MockExamRecord>;
}

export class MockExamRecordArrayResponseDto extends ResponseDto<MockExamRecord> {
  @ApiProperty({ type: () => MockExamRecord, isArray: true })
  data?: MockExamRecord[];
}

export class MockExamsResponseDto extends ResponseDto<MockExams> {
  @ApiProperty({ type: () => MockExams })
  data?: MockExams;
}

export class MockExamsResponseCountDto extends ResponseDto<
  PResponseDto<MockExams>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<MockExams> })
  data?: PResponseDto<MockExams>;
}

export class MockExamsArrayResponseDto extends ResponseDto<MockExams> {
  @ApiProperty({ type: () => MockExams, isArray: true })
  data?: MockExams[];
}

export class MockExamCommentResponseDto extends ResponseDto<MockExamComment> {
  @ApiProperty({ type: () => MockExamComment })
  data?: MockExamComment;
}
export class MockExamCommentResponseCountDto extends ResponseDto<
  PResponseDto<MockExamComment>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<MockExamComment> })
  data?: PResponseDto<MockExamComment>;
}

export class MockExamCommentArrayResponseDto extends ResponseDto<MockExamComment> {
  @ApiProperty({ type: () => MockExamComment, isArray: true })
  data?: MockExamComment[];
}

export class MockQuestionsResponseDto extends ResponseDto<MockQuestions> {
  @ApiProperty({ type: () => MockQuestions })
  data?: MockQuestions;
}

export class MockQuestionsResponseCountDto extends ResponseDto<
  PResponseDto<MockQuestions>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<MockQuestions> })
  data?: PResponseDto<MockQuestions>;
}

export class MockQuestionsArrayResponseDto extends ResponseDto<MockQuestions> {
  @ApiProperty({ type: () => MockQuestions, isArray: true })
  data?: MockQuestions[];
}

export class MockTypesResponseDto extends ResponseDto<MockTypes> {
  @ApiProperty({ type: () => MockTypes })
  data?: MockTypes;
}

export class MockTypesResponseCountDto extends ResponseDto<
  PResponseDto<MockTypes>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<MockTypes> })
  data?: PResponseDto<MockTypes>;
}

export class MockTypesArrayResponseDto extends ResponseDto<MockTypes> {
  @ApiProperty({ type: () => MockTypes, isArray: true })
  data?: MockTypes[];
}

export class StudentsMockAnswersResponseDto extends ResponseDto<StudentsMockAnswers> {
  @ApiProperty({ type: () => StudentsMockAnswers })
  data?: StudentsMockAnswers;
}

export class StudentsMockAnswersResponseCountDto extends ResponseDto<
  PResponseDto<StudentsMockAnswers>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<StudentsMockAnswers> })
  data?: PResponseDto<StudentsMockAnswers>;
}

export class StudentsMockAnswersArrayResponseDto extends ResponseDto<StudentsMockAnswers> {
  @ApiProperty({ type: () => StudentsMockAnswers, isArray: true })
  data?: StudentsMockAnswers[];
}

export class GroupChatResponseDto extends ResponseDto<GroupChat> {
  @ApiProperty({ type: () => GroupChat })
  data?: GroupChat;
}

export class GroupChatResponseCountDto extends ResponseDto<
  PResponseDto<GroupChat>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<GroupChat> })
  data?: PResponseDto<GroupChat>;
}

export class GroupChatArrayResponseDto extends ResponseDto<GroupChat> {
  @ApiProperty({ type: () => GroupChat, isArray: true })
  data?: GroupChat[];
}

export class GroupResponseDto extends ResponseDto<Group> {
  @ApiProperty({ type: () => Group })
  data?: Group;
}

export class GroupResponseCountDto extends ResponseDto<PResponseDto<Group>> {
  @ApiPropertyOptional({ type: () => PResponseDto<Group> })
  data?: PResponseDto<Group>;
}

export class GroupArrayResponseDto extends ResponseDto<Group> {
  @ApiProperty({ type: () => Group, isArray: true })
  data?: Group[];
}

export class UserSubjectResponseDto extends ResponseDto<UserSubject> {
  @ApiProperty({ type: () => UserSubject })
  data?: UserSubject;
}

export class UserSubjectResponseCountDto extends ResponseDto<
  PResponseDto<UserSubject>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<UserSubject> })
  data?: PResponseDto<UserSubject>;
}

export class UserSubjectArrayResponseDto extends ResponseDto<UserSubject> {
  @ApiProperty({ type: () => UserSubject, isArray: true })
  data?: UserSubject[];
}

export class SubscriptionTransactionResponseDto extends ResponseDto<SubscriptionTransaction> {
  @ApiProperty({ type: () => SubscriptionTransaction })
  data?: SubscriptionTransaction;
}

export class SubscriptionTransactionResponseCountDto extends ResponseDto<
  PResponseDto<SubscriptionTransaction>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<SubscriptionTransaction> })
  data?: PResponseDto<SubscriptionTransaction>;
}

export class SubscriptionTransactionArrayResponseDto extends ResponseDto<SubscriptionTransaction> {
  @ApiProperty({ type: () => SubscriptionTransaction, isArray: true })
  data?: SubscriptionTransaction[];
}

export class SubscriptionResponseDto extends ResponseDto<Subscription> {
  @ApiProperty({ type: () => Subscription })
  data?: Subscription;
}

export class SubscriptionResponseCountDto extends ResponseDto<
  PResponseDto<Subscription>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<Subscription> })
  data?: PResponseDto<Subscription>;
}

export class SubscriptionArrayResponseDto extends ResponseDto<Subscription> {
  @ApiProperty({ type: () => Subscription, isArray: true })
  data?: Subscription[];
}

export class V1BattleQuestionAnswersResponseDto extends ResponseDto<V1BattleQuestionAnswers> {
  @ApiProperty({ type: () => V1BattleQuestionAnswers })
  data?: V1BattleQuestionAnswers;
}

export class V1BattleQuestionAnswersResponseCountDto extends ResponseDto<
  PResponseDto<V1BattleQuestionAnswers>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<V1BattleQuestionAnswers> })
  data?: PResponseDto<V1BattleQuestionAnswers>;
}

export class V1BattleQuestionAnswersArrayResponseDto extends ResponseDto<V1BattleQuestionAnswers> {
  @ApiProperty({ type: () => V1BattleQuestionAnswers, isArray: true })
  data?: V1BattleQuestionAnswers[];
}

export class V1BattleRecordResponseDto extends ResponseDto<V1BattleRecord> {
  @ApiProperty({ type: () => V1BattleRecord })
  data?: V1BattleRecord;
}

export class V1BattleRecordResponseCountDto extends ResponseDto<
  PResponseDto<V1BattleRecord>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<V1BattleRecord> })
  data?: PResponseDto<V1BattleRecord>;
}

export class V1BattleRecordArrayResponseDto extends ResponseDto<V1BattleRecord> {
  @ApiProperty({ type: () => V1BattleRecord, isArray: true })
  data?: V1BattleRecord[];
}

export class V1BattleResponseDto extends ResponseDto<V1Battle> {
  @ApiProperty({ type: () => V1Battle })
  data?: V1Battle;
}

export class V1BattleResponseCountDto extends ResponseDto<
  PResponseDto<V1Battle>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<V1Battle> })
  data?: PResponseDto<V1Battle>;
}

export class V1BattleArrayResponseDto extends ResponseDto<V1Battle> {
  @ApiProperty({ type: () => V1Battle, isArray: true })
  data?: V1Battle[];
}

export class LessonCommentResponseDto extends ResponseDto<LessonComment> {
  @ApiProperty({ type: () => LessonComment })
  data?: LessonComment;
}

export class LessonCommentResponseCountDto extends ResponseDto<
  PResponseDto<LessonComment>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<LessonComment> })
  data?: PResponseDto<LessonComment>;
}

export class LessonCommentArrayResponseDto extends ResponseDto<LessonComment> {
  @ApiProperty({ type: () => LessonComment, isArray: true })
  data?: LessonComment[];
}

export class LessonTrackingResponseDto extends ResponseDto<LessonTracking> {
  @ApiProperty({ type: () => LessonTracking })
  data?: LessonTracking;
}

export class LessonTrackingResponseCountDto extends ResponseDto<
  PResponseDto<LessonTracking>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<LessonTracking> })
  data?: PResponseDto<LessonTracking>;
}

export class LessonTrackingArrayResponseDto extends ResponseDto<LessonTracking> {
  @ApiProperty({ type: () => LessonTracking, isArray: true })
  data?: LessonTracking[];
}

export class QuizQuestionsResponseDto extends ResponseDto<QuizQuestions> {
  @ApiProperty({ type: () => QuizQuestions })
  data?: QuizQuestions;
}

export class QuizQuestionsResponseCountDto extends ResponseDto<
  PResponseDto<QuizQuestions>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<QuizQuestions> })
  data?: PResponseDto<QuizQuestions>;
}

export class QuizQuestionsArrayResponseDto extends ResponseDto<QuizQuestions> {
  @ApiProperty({ type: () => QuizQuestions, isArray: true })
  data?: QuizQuestions[];
}

export class QuizRecordResponseDto extends ResponseDto<QuizRecord> {
  @ApiProperty({ type: () => QuizRecord })
  data?: QuizRecord;
}

export class QuizRecordResponseCountDto extends ResponseDto<
  PResponseDto<QuizRecord>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<QuizRecord> })
  data?: PResponseDto<QuizRecord>;
}

export class QuizRecordArrayResponseDto extends ResponseDto<QuizRecord> {
  @ApiProperty({ type: () => QuizRecord, isArray: true })
  data?: QuizRecord[];
}

export class QuizzesResponseDto extends ResponseDto<Quizzes> {
  @ApiProperty({ type: () => Quizzes })
  data?: Quizzes;
}

export class QuizzesResponseCountDto extends ResponseDto<
  PResponseDto<Quizzes>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<Quizzes> })
  data?: PResponseDto<Quizzes>;
}

export class QuizzesArrayResponseDto extends ResponseDto<Quizzes> {
  @ApiProperty({ type: () => Quizzes, isArray: true })
  data?: Quizzes[];
}

export class QuizCommentResponseDto extends ResponseDto<QuizComment> {
  @ApiProperty({ type: () => QuizComment })
  data?: QuizComment;
}

export class QuizCommentResponseCountDto extends ResponseDto<
  PResponseDto<QuizComment>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<QuizComment> })
  data?: PResponseDto<QuizComment>;
}

export class QuizCommentArrayResponseDto extends ResponseDto<QuizComment> {
  @ApiProperty({ type: () => QuizComment, isArray: true })
  data?: QuizComment[];
}

export class StudentsQuizAnswersResponseDto extends ResponseDto<StudentsQuizAnswers> {
  @ApiProperty({ type: () => StudentsQuizAnswers })
  data?: StudentsQuizAnswers;
}

export class StudentsQuizAnswersResponseCountDto extends ResponseDto<
  PResponseDto<StudentsQuizAnswers>
> {
  @ApiPropertyOptional({ type: () => PResponseDto<StudentsQuizAnswers> })
  data?: PResponseDto<StudentsQuizAnswers>;
}

export class StudentsQuizAnswersArrayResponseDto extends ResponseDto<StudentsQuizAnswers> {
  @ApiProperty({ type: () => StudentsQuizAnswers, isArray: true })
  data?: StudentsQuizAnswers[];
}
