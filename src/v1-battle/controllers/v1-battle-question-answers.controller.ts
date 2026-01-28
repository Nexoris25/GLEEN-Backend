import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { V1BattleQuestionAnswersService } from '../services/v1-battle-question-answers.service';
import { CreateV1BattleQuestionAnswersDto } from '../dto/create-v1-battle-question-answers.dto';
import { UpdateV1BattleQuestionAnswersDto } from '../dto/update-v1-battle-question-answers.dto';
import { SearchV1BattleQuestionAnswersDto } from '../dto/search-v1-battle-question-answers.dto';
import stringify from 'safe-stable-stringify';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { ResponseDto, V1BattleQuestionAnswersResponseCountDto, V1BattleQuestionAnswersResponseDto } from 'src/shared-types/response.dto';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { QuizQuestionsService } from 'src/lesson/services/quiz-question.service';

@ApiTags('V1 Battle Question Answers')
@ApiBearerAuth()
@Controller('v1-battle-question-answers')
@UseGuards(JwtAuthGuard)
export class V1BattleQuestionAnswersController {
  constructor(private readonly v1BattleQuestionAnswersService: V1BattleQuestionAnswersService,
    private readonly quizQuestionService: QuizQuestionsService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new battle question answer' })
  @ApiBody({ type: CreateV1BattleQuestionAnswersDto })
  @ApiResponse({ status: 201, description: 'Battle question answer created successfully', type: V1BattleQuestionAnswersResponseDto })
  @ApiResponse({ status: 500, description: 'Error creating battle question answer', type: ResponseDto<null> })
  async create(@Body() createDto: CreateV1BattleQuestionAnswersDto, @UserId() userId: string): Promise<V1BattleQuestionAnswersResponseDto> {
    try {
      const quizQuestion = await this.quizQuestionService.findById(createDto.quizQuestionId);

      if (!quizQuestion) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Quiz Question for the given Id Could not be found",
        }

      }
      const answer = await this.v1BattleQuestionAnswersService.create(createDto, userId);
      return {
        status: HttpStatus.CREATED,
        message: 'Battle question answer created successfully',
        data: answer,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error creating battle question answer',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all battle question answers (optionally by search)' })
  @ApiQuery({ name: 'quizQuestionId', required: false, type: String })
  @ApiQuery({ name: 'vOneBattleId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'score', required: false, type: Number })
  @ApiQuery({ name: 'answer', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Battle question answers retrieved successfully', type: V1BattleQuestionAnswersResponseCountDto })
  @ApiResponse({ status: 500, description: 'Error retrieving battle question answers', type: ResponseDto<null> })
  async findAll(@Query() searchDto: SearchV1BattleQuestionAnswersDto): Promise<V1BattleQuestionAnswersResponseCountDto> {
    try {
      const answers = await this.v1BattleQuestionAnswersService.findAll(searchDto);
      return {
        status: HttpStatus.OK,
        message: 'Battle question answers retrieved successfully',
        data: answers,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving battle question answers',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a battle question answer by ID' })
  @ApiParam({ name: 'id', description: 'Battle question answer ID' })
  @ApiResponse({ status: 200, description: 'Battle question answer retrieved successfully', type: V1BattleQuestionAnswersResponseDto })
  @ApiResponse({ status: 404, description: 'Battle question answer not found', type: ResponseDto<null> })
  @ApiResponse({ status: 500, description: 'Error retrieving battle question answer', type: ResponseDto<null> })
  async findOne(@Param('id') id: string): Promise<V1BattleQuestionAnswersResponseDto> {
    try {
      const answer = await this.v1BattleQuestionAnswersService.findOne(id);
      return {
        status: HttpStatus.OK,
        message: 'Battle question answer retrieved successfully',
        data: answer,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving battle question answer',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a battle question answer by ID' })
  @ApiParam({ name: 'id', description: 'Battle question answer ID' })
  @ApiBody({ type: UpdateV1BattleQuestionAnswersDto })
  @ApiResponse({ status: 200, description: 'Battle question answer updated successfully', type: V1BattleQuestionAnswersResponseDto })
  @ApiResponse({ status: 500, description: 'Error updating battle question answer', type: ResponseDto<null> })
  async update(@Param('id') id: string, @Body() updateDto: UpdateV1BattleQuestionAnswersDto): Promise<V1BattleQuestionAnswersResponseDto> {
    try {
      const answer = await this.v1BattleQuestionAnswersService.update(id, updateDto);
      return {
        status: HttpStatus.OK,
        message: 'Battle question answer updated successfully',
        data: answer,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error updating battle question answer',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a battle question answer by ID' })
  @ApiParam({ name: 'id', description: 'Battle question answer ID' })
  @ApiResponse({ status: 200, description: 'Battle question answer deleted successfully', type: ResponseDto<null> })
  @ApiResponse({ status: 500, description: 'Error deleting battle question answer', type: ResponseDto<null> })
  async remove(@Param('id') id: string): Promise<ResponseDto<null>> {
    try {
      await this.v1BattleQuestionAnswersService.remove(id);
      return {
        status: HttpStatus.OK,
        message: 'Battle question answer deleted successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error deleting battle question answer',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
