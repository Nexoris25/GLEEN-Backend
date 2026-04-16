import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  Delete,
  Query,
} from '@nestjs/common';
import { StudentsQuizAnswersService } from '../services/student-quiz-answer.service';
import { CreateStudentQuizAnswerDto } from '../dto/create-student-quiz-answer.dto';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { StudentsQuizAnswers } from '../models/students_quiz_answers';
import {
  ResponseDto,
  StudentsQuizAnswersResponseCountDto,
  StudentsQuizAnswersResponseDto,
} from 'src/shared-types/response.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { SearchQuizAnswerDto } from '../dto/search-quiz-answer.dto';
import stringify from 'safe-stable-stringify';

@ApiTags('Student Quiz Answer')
@Controller('student-quiz-answers')
@UseGuards(JwtAuthGuard)
export class StudentQuizAnswerController {
  constructor(
    private readonly studentsQuizAnswersService: StudentsQuizAnswersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new student quiz answer' })
  @ApiBody({ type: CreateStudentQuizAnswerDto })
  @ApiResponse({
    status: 201,
    description: 'The student quiz answer has been successfully created.',
    type: StudentsQuizAnswersResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error creating student quiz answer',
    type: ResponseDto<null>,
  })
  async create(
    @Body() createDto: CreateStudentQuizAnswerDto,
    @UserId() userId,
  ): Promise<StudentsQuizAnswersResponseDto> {
    try {
      const x = await this.studentsQuizAnswersService.create(createDto, userId);
      return {
        status: 201,
        data: x,
        message: 'Student quiz answer created successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error creating student quiz answer',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all student quiz answers' })
  @ApiResponse({
    status: 200,
    description: 'List of student quiz answers',
    type: StudentsQuizAnswersResponseCountDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error fetching student quiz answers',
    type: ResponseDto<null>,
  })
  async findAll(
    @Query() query: SearchQuizAnswerDto,
  ): Promise<StudentsQuizAnswersResponseCountDto> {
    try {
      const x = await this.studentsQuizAnswersService.findAll(query);
      return {
        status: 200,
        data: x,
        message: 'Student quiz answers fetched successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error fetching student quiz answers',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a student quiz answer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Student quiz answer fetched successfully',
    type: StudentsQuizAnswersResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error fetching student quiz answer',
    type: ResponseDto<null>,
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<StudentsQuizAnswersResponseDto> {
    try {
      const x = await this.studentsQuizAnswersService.findById(id);
      return {
        status: 200,
        data: x,
        message: 'Student quiz answer fetched successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error fetching student quiz answer',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a student quiz answer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Student quiz answer deleted successfully',
    type: ResponseDto<void>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error deleting student quiz answer',
    type: ResponseDto<null>,
  })
  async remove(@Param('id') id: string): Promise<ResponseDto<void>> {
    try {
      await this.studentsQuizAnswersService.delete(id);
      return {
        status: 200,
        message: 'Student quiz answer deleted successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error deleting student quiz answer',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all student quiz answers by user ID' })
  @ApiResponse({
    status: 200,
    description: 'List of student quiz answers by user ID',
    type: ResponseDto<StudentsQuizAnswers[]>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error fetching student quiz answers by user ID',
    type: ResponseDto<null>,
  })
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<ResponseDto<StudentsQuizAnswers[]>> {
    try {
      const x = await this.studentsQuizAnswersService.findByUserId(userId);
      return {
        status: 200,
        data: x,
        message: 'Student quiz answers fetched successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error fetching student quiz answers',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('quiz/:quizId/user/:userId')
  @ApiOperation({
    summary: 'Get all student quiz answers by quiz ID and user ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of student quiz answers by quiz ID and user ID',
    type: ResponseDto<StudentsQuizAnswers[]>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error fetching student quiz answers by quiz ID and user ID',
    type: ResponseDto<null>,
  })
  async findByQuizAndUserId(
    @Param('quizId') quizId: string,
    @Param('userId') userId: string,
  ): Promise<ResponseDto<StudentsQuizAnswers[]>> {
    try {
      const x = await this.studentsQuizAnswersService.findByQuizAndUserId(
        quizId,
        userId,
      );
      return {
        status: 200,
        data: x,
        message: 'Student quiz answers fetched successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error fetching student quiz answers',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('question/:quizQuestionId/user/:userId')
  @ApiOperation({
    summary: 'Get a student quiz answer by question ID and user ID',
  })
  @ApiResponse({
    status: 200,
    description: 'The student quiz answer',
    type: StudentsQuizAnswersResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error fetching student quiz answer by question and user',
    type: ResponseDto<null>,
  })
  async findByQuestionAndUserId(
    @Param('quizQuestionId') quizQuestionId: string,
    @Param('userId') userId: string,
  ): Promise<StudentsQuizAnswersResponseDto> {
    try {
      const x = await this.studentsQuizAnswersService.findByQuizQuestionAndUser(
        quizQuestionId,
        userId,
      );
      return {
        status: 200,
        data: x,
        message: 'Student quiz answer fetched successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error fetching student quiz answer',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
