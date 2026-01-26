import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { QuizQuestionsService } from '../services/quiz-question.service';
import { CreateQuizQuestionDto } from '../dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from '../dto/update-quiz-question.dto';
import { QuizQuestionsResponseCountDto, QuizQuestionsResponseDto, ResponseDto } from 'src/shared-types/response.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { SearchQuizQuestionDto } from '../dto/search-quiz-question.dto';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import stringify from "safe-stable-stringify";


@ApiTags('Quiz Questions')
@Controller('quiz-questions')
@UseGuards(JwtAuthGuard)
export class QuizQuestionController {
    constructor(private readonly quizQuestionsService: QuizQuestionsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new quiz question' })
    @ApiBody({ type: CreateQuizQuestionDto })
    @ApiResponse({ status: 201, description: 'The quiz question has been successfully created.', type: QuizQuestionsResponseDto })
    @ApiResponse({ status: 500, description: 'Error creating quiz question', type: ResponseDto<null> })
    async create(@Body() createDto: CreateQuizQuestionDto, @UserId() userId: string): Promise<QuizQuestionsResponseDto> {
        try {
            const x = await this.quizQuestionsService.create(createDto, userId);
            return {
                status: 201,
                data: x,
                message: 'Quiz question created successfully',
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error creating quiz question',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all quiz questions' })
    @ApiResponse({ status: 200, description: 'List of quiz questions', type: QuizQuestionsResponseCountDto })
    @ApiResponse({ status: 500, description: 'Error fetching quiz questions', type: ResponseDto<null> })
    async findAll(
        @Query() searchDto: SearchQuizQuestionDto
    ): Promise<QuizQuestionsResponseCountDto> {
        try {
            const x = await this.quizQuestionsService.findAll(searchDto);
            return {
                status: 200,
                data: x,
                message: 'Quiz questions fetched successfully',
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error fetching quiz questions',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a quiz question by ID' })
    @ApiResponse({ status: 200, description: 'The quiz question', type: QuizQuestionsResponseDto })
    @ApiResponse({ status: 404, description: 'Quiz question not found', type: ResponseDto<null> })
    @ApiResponse({ status: 500, description: 'Error fetching quiz question', type: ResponseDto<null> })
    async findById(@Param('id') id: string): Promise<QuizQuestionsResponseDto> {
        try {
            const x = await this.quizQuestionsService.findById(id);
            if (!x) {
                return {
                    status: 404,
                    message: 'Quiz question not found',
                    data: null,
                };
            }
            return {
                status: 200,
                data: x,
                message: 'Quiz question fetched successfully',
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error fetching quiz question',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a quiz question by ID' })
    @ApiBody({ type: UpdateQuizQuestionDto })
    @ApiResponse({ status: 200, description: 'The quiz question has been successfully updated.', type: QuizQuestionsResponseDto })
    @ApiResponse({ status: 404, description: 'Quiz question not found', type: ResponseDto<null> })
    @ApiResponse({ status: 500, description: 'Error updating quiz question', type: ResponseDto<null> })
    async update(@Param('id') id: string, @Body() updateDto: UpdateQuizQuestionDto): Promise<QuizQuestionsResponseDto> {
        try {
            const x = await this.quizQuestionsService.update(id, updateDto);
            if (!x) {
                return {
                    status: 404,
                    message: 'Quiz question not found',
                    data: null,
                };
            }
            return {
                status: 200,
                data: x,
                message: 'Quiz question updated successfully',
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error updating quiz question',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a quiz question by ID' })
    @ApiResponse({ status: 200, description: 'The quiz question has been successfully deleted.', type: ResponseDto<null> })
    @ApiResponse({ status: 404, description: 'Quiz question not found', type: ResponseDto<null> })
    @ApiResponse({ status: 500, description: 'Error deleting quiz question', type: ResponseDto<null> })
    async delete(@Param('id') id: string): Promise<ResponseDto<null>> {
        try {
            const deleted = await this.quizQuestionsService.delete(id);
            if (!deleted) {
                return {
                    status: 404,
                    message: 'Quiz question not found',
                    data: null,
                };
            }
            return {
                status: 200,
                message: 'Quiz question deleted successfully',
                data: null,
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error deleting quiz question',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

}