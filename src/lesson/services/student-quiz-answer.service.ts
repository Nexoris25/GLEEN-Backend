import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StudentsQuizAnswers } from '../models/students_quiz_answers';
import { SearchQuizAnswerDto } from '../dto/search-quiz-answer.dto';
import stringify from 'safe-stable-stringify';
import { Op } from 'sequelize';
import { QuizQuestionsService } from './quiz-question.service';

@Injectable()
export class StudentsQuizAnswersService {
  constructor(
    @InjectModel(StudentsQuizAnswers)
    private studentsQuizAnswersModel: typeof StudentsQuizAnswers,
    private readonly quizQuestionService: QuizQuestionsService,
  ) {}

  async create(
    answerData: { quizQuestionId: string; answer: string },
    userId: string,
  ): Promise<StudentsQuizAnswers> {
    try {
      const { quizQuestionId, answer } = answerData;

      const quizQuestion =
        await this.quizQuestionService.findById(quizQuestionId);

      if (!quizQuestion) {
        throw new Error('Quiz Question for the given Id Could not be found');
      }

      const score =
        quizQuestion.correctAnswer.toLowerCase() === answer.toLowerCase() ||
        quizQuestion.correctAnswer === answer
          ? 1
          : 0;

      const newAnswer = await this.studentsQuizAnswersModel.create(
        { quizQuestionId, answer, score },
        { isNewRecord: true, userId },
      );

      // Compute and update quiz record after answer creation
      await this.computeAndUpdateQuizRecord(newAnswer.quizQuestionId, userId);

      return newAnswer;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating student quiz answer:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(
    searchDto: SearchQuizAnswerDto,
  ): Promise<{ rows: StudentsQuizAnswers[]; count: number }> {
    try {
      const { limit, offset, ...filters } = searchDto;
      const where: any = { ...filters };
      if (filters.userId) {
        where.userId = filters.userId;
      }
      if (filters.quizQuestionId) {
        where.quizQuestionId = filters.quizQuestionId;
      }
      if (filters.answer) {
        where.answer = { [Op.iLike]: `%${filters.answer}%` };
      }
      return await this.studentsQuizAnswersModel.findAndCountAll({
        where,
        limit,
        offset,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching student quiz answers:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findByQuizQuestionAndUser(
    quizQuestionId: string,
    userId: string,
  ): Promise<StudentsQuizAnswers | null> {
    try {
      return await this.studentsQuizAnswersModel.findOne({
        where: { quizQuestionId, userId },
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching student quiz answer by question and user:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findByQuizAndUserId(
    quizId: string,
    userId: string,
  ): Promise<StudentsQuizAnswers[]> {
    try {
      return await this.studentsQuizAnswersModel.findAll({
        where: { userId },
        include: [{ association: 'quizQuestion', where: { quizId } }],
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching student quiz answers by quiz ID:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findById(id: string): Promise<StudentsQuizAnswers | null> {
    try {
      return await this.studentsQuizAnswersModel.findByPk(id);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching student quiz answer by ID:',
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
    updateData: Partial<StudentsQuizAnswers>,
  ): Promise<StudentsQuizAnswers | null> {
    try {
      const answer = await this.studentsQuizAnswersModel.findByPk(id);
      if (!answer) {
        return null;
      }
      const quizQuestion = await this.quizQuestionService.findById(
        answer.quizQuestionId,
      );
      if (!quizQuestion) {
        throw new Error('Quiz Question for the given Id Could not be found');
      }
      const score =
        quizQuestion.correctAnswer.toLowerCase() ===
          updateData.answer.toLowerCase() ||
        quizQuestion.correctAnswer === updateData.answer
          ? 1
          : 0;
      const updatedAnswer = await answer.update({ ...updateData, score });
      // Compute and update quiz record after answer update
      await this.computeAndUpdateQuizRecord(
        answer.quizQuestionId,
        answer.userId,
      );

      return updatedAnswer;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating student quiz answer:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
  /**
   * Computes and updates the quiz record for a user and quiz after answer creation or update
   */
  private async computeAndUpdateQuizRecord(
    quizQuestionId: string,
    userId: string,
  ): Promise<void> {
    // Get the quiz question to find the quizId
    const quizQuestion =
      await this.studentsQuizAnswersModel.sequelize.models.QuizQuestions.findByPk(
        quizQuestionId,
      );
    if (!quizQuestion) return;
    const quizId = quizQuestion.getDataValue('quizId');

    // Get all questions for the quiz
    const allQuestions =
      await this.studentsQuizAnswersModel.sequelize.models.QuizQuestions.findAll(
        { where: { quizId } },
      );
    const totalQuestions = allQuestions.length;

    // Get all answers for this user and quiz
    const allAnswers = await this.studentsQuizAnswersModel.findAll({
      where: { userId },
      include: [{ association: 'quizQuestion', where: { quizId } }],
    });
    const totalAnsweredQuestions = allAnswers.length;
    const totalUnansweredQuestions = totalQuestions - totalAnsweredQuestions;

    // Compute correct/incorrect answers
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let obtainedMarks = 0;
    const totalMarks = totalQuestions; // assuming 1 mark per question
    for (const ans of allAnswers) {
      if (ans.answer === ans.quizQuestion.correctAnswer) {
        correctAnswers++;
        obtainedMarks++;
      } else {
        incorrectAnswers++;
      }
    }

    // Upsert quiz record
    const quizRecordModel =
      this.studentsQuizAnswersModel.sequelize.models.QuizRecord;
    const [record, created] = await quizRecordModel.findOrCreate({
      where: { quizId, userId },
      defaults: {
        quizId,
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

  async delete(id: string): Promise<boolean> {
    try {
      const deletedCount = await this.studentsQuizAnswersModel.destroy({
        where: { id },
      });
      return deletedCount > 0;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting student quiz answer:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findByUserId(userId: string): Promise<StudentsQuizAnswers[]> {
    try {
      return await this.studentsQuizAnswersModel.findAll({ where: { userId } });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching student quiz answers by user ID:',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
