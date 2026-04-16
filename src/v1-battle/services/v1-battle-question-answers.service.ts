import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { V1BattleQuestionAnswers } from '../models/v1-battle-question-answers.model';
import { CreateV1BattleQuestionAnswersDto } from '../dto/create-v1-battle-question-answers.dto';
import { UpdateV1BattleQuestionAnswersDto } from '../dto/update-v1-battle-question-answers.dto';
import { SearchV1BattleQuestionAnswersDto } from '../dto/search-v1-battle-question-answers.dto';
import stringify from 'safe-stable-stringify';
import { QuizQuestionsService } from 'src/lesson/services/quiz-question.service';

@Injectable()
export class V1BattleQuestionAnswersService {
  constructor(
    @InjectModel(V1BattleQuestionAnswers)
    private readonly v1BattleQuestionAnswersModel: typeof V1BattleQuestionAnswers,
    private readonly quizQuestionService: QuizQuestionsService,
  ) {}

  async create(
    createDto: CreateV1BattleQuestionAnswersDto,
    userId: string,
  ): Promise<V1BattleQuestionAnswers> {
    try {
      const quizQuestion = await this.quizQuestionService.findById(
        createDto.quizQuestionId,
      );

      if (!quizQuestion) {
        throw new Error('Quiz Question for the given Id Could not be found');
      }

      const score =
        quizQuestion.correctAnswer.toLowerCase() ===
          createDto.answer.toLowerCase() ||
        quizQuestion.correctAnswer === createDto.answer
          ? 1
          : 0;
      const newAnswer = await this.v1BattleQuestionAnswersModel.create(
        { ...createDto, score, userId },
        { isNewRecord: true, userId },
      );

      // Compute and update V1BattleRecord after answer creation
      await this.computeAndUpdateBattleRecord(newAnswer.vOneBattleId, userId);

      return newAnswer;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating battle question answer',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(
    searchDto?: SearchV1BattleQuestionAnswersDto,
  ): Promise<{ rows: V1BattleQuestionAnswers[]; count: number }> {
    try {
      const where: any = {};
      if (searchDto) {
        if (searchDto.quizQuestionId)
          where.quizQuestionId = searchDto.quizQuestionId;
        if (searchDto.vOneBattleId) where.vOneBattleId = searchDto.vOneBattleId;
        if (searchDto.userId) where.userId = searchDto.userId;
        if (searchDto.score !== undefined) where.score = searchDto.score;
        if (searchDto.answer) where.answer = searchDto.answer;
      }
      return await this.v1BattleQuestionAnswersModel.findAndCountAll({
        where,
        offset: searchDto?.offset,
        limit: searchDto?.limit,
        include: [
          {
            association: 'quizQuestion',
          },
        ],
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching battle question answers',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findOne(id: string): Promise<V1BattleQuestionAnswers> {
    try {
      const answer = await this.v1BattleQuestionAnswersModel.findByPk(id);
      if (!answer) {
        throw new NotFoundException(
          `Battle question answer with ID ${id} not found`,
        );
      }
      return answer;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching battle question answer',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async update(
    id: string,
    updateDto: UpdateV1BattleQuestionAnswersDto,
  ): Promise<V1BattleQuestionAnswers> {
    try {
      const answer = await this.findOne(id);
      const quizQuestion = await this.quizQuestionService.findById(
        answer.quizQuestionId,
      );
      if (!quizQuestion) {
        throw new Error('Quiz Question for the given Id Could not be found');
      }
      const score =
        quizQuestion.correctAnswer.toLowerCase() ===
          updateDto.answer.toLowerCase() ||
        quizQuestion.correctAnswer === updateDto.answer
          ? 1
          : 0;
      const updatedAnswer = await answer.update({ ...updateDto, score });

      // Compute and update V1BattleRecord after answer update
      await this.computeAndUpdateBattleRecord(
        answer.vOneBattleId,
        answer.userId,
      );

      return updatedAnswer;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating battle question answer',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
  /**
   * Computes and updates the V1BattleRecord for a user and battle after answer creation or update
   */
  private async computeAndUpdateBattleRecord(
    vOneBattleId: string,
    userId: string,
  ): Promise<void> {
    // Get all questions for the battle
    const quizQuestionsModel =
      this.v1BattleQuestionAnswersModel.sequelize.models.QuizQuestions;
    const allQuestions = await quizQuestionsModel.findAll({
      where: { quizId: vOneBattleId },
    });
    const totalQuestions = allQuestions.length;

    // Get all answers for this user and battle
    const allAnswers = await this.v1BattleQuestionAnswersModel.findAll({
      where: { userId, vOneBattleId },
    });
    const totalAnsweredQuestions = allAnswers.length;
    const totalUnansweredQuestions = totalQuestions - totalAnsweredQuestions;

    // Compute correct/incorrect answers
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let obtainedMarks = 0;
    const totalMarks = totalQuestions; // assuming 1 mark per question
    for (const ans of allAnswers) {
      // Load the related quiz question to check correct answer
      const quizQuestion = await quizQuestionsModel.findByPk(
        ans.quizQuestionId,
      );
      const correctAnswer = quizQuestion
        ? quizQuestion.getDataValue('correctAnswer')
        : undefined;
      if (quizQuestion && ans.answer === correctAnswer) {
        correctAnswers++;
        obtainedMarks++;
      } else {
        incorrectAnswers++;
      }
    }

    // Upsert V1BattleRecord
    const battleRecordModel =
      this.v1BattleQuestionAnswersModel.sequelize.models.V1BattleRecord;
    const [record, created] = await battleRecordModel.findOrCreate({
      where: { vOneBattleId, userId },
      defaults: {
        vOneBattleId,
        userId,
        totalMarks,
        obtainedMarks,
        totalQuestions,
        totalAnsweredQuestions,
        totalUnansweredQuestions,
        correctAnswers,
        incorrectAnswers,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
      },
    });
    await record.update({
      totalMarks,
      obtainedMarks,
      totalQuestions,
      totalAnsweredQuestions,
      totalUnansweredQuestions,
      correctAnswers,
      incorrectAnswers,
      endedAt: new Date().toISOString(),
    });
  }

  async remove(id: string): Promise<void> {
    try {
      const answer = await this.findOne(id);
      await answer.destroy();
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting battle question answer',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
