import { Body, Controller, Get, Param, Post, UseGuards, Request, Delete, Query } from '@nestjs/common';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { ResponseDto, StudentsMockAnswersResponseCountDto, StudentsMockAnswersResponseDto } from 'src/shared-types/response.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import stringify from "safe-stable-stringify";
import { StudentsMockAnswersService } from '../services/student-mock-answers.service';
import { CreateStudentMockAnswerDto } from '../dtos/create-student-mock-answer.dto';
import { StudentsMockAnswers } from '../models/students-mock-answers.model';
import { SearchMockAnswerDto } from '../dtos/search-mock-answer.dto';

@ApiTags('Student Mock Answer')
@Controller('student-mock-answers')
@UseGuards(JwtAuthGuard)
export class StudentMockAnswerController {
    constructor(private readonly studentsMockAnswersService: StudentsMockAnswersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new student mock answer' })
    @ApiBody({ type: CreateStudentMockAnswerDto })
    @ApiResponse({ status: 201, description: 'The student mock answer has been successfully created.', type: StudentsMockAnswersResponseDto })
    @ApiResponse({ status: 500, description: 'Error creating student mock answer', type: ResponseDto<null> })
    async create(@Body() createDto: CreateStudentMockAnswerDto, @UserId() userId): Promise<StudentsMockAnswersResponseDto> {
        try {
            const x = await this.studentsMockAnswersService.create(createDto, userId);
            return {
                status: 201,
                data: x,
                message: 'Student mock answer created successfully',
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error creating student mock answer',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all student mock answers' })
    @ApiResponse({ status: 200, description: 'List of student mock answers', type: StudentsMockAnswersResponseCountDto })
    @ApiResponse({ status: 500, description: 'Error fetching student mock answers', type: ResponseDto<null> })
    async findAll(@Query() query: SearchMockAnswerDto): Promise<StudentsMockAnswersResponseCountDto> {
        try {
            const x = await this.studentsMockAnswersService.findAll(query);
            return {
                status: 200,
                data: x,
                message: 'Student mock answers fetched successfully',
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error fetching student mock answers',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a student mock answer by ID' })
    @ApiResponse({ status: 200, description: 'Student mock answer fetched successfully', type: StudentsMockAnswersResponseDto })
    @ApiResponse({ status: 500, description: 'Error fetching student mock answer', type: ResponseDto<null> })
    async findOne(@Param('id') id: string): Promise<ResponseDto<StudentsMockAnswers>> {
        try {
            const x = await this.studentsMockAnswersService.findById(id);
            return {
                status: 200,
                data: x,
                message: 'Student mock answer fetched successfully',
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error fetching student mock answer',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a student mock answer by ID' })
    @ApiResponse({ status: 200, description: 'Student mock answer deleted successfully', type: ResponseDto<void> })
    @ApiResponse({ status: 500, description: 'Error deleting student mock answer', type: ResponseDto<null> })
    async remove(@Param('id') id: string): Promise<ResponseDto<void>> {
        try {
            await this.studentsMockAnswersService.delete(id);
            return {
                status: 200,
                message: 'Student mock answer deleted successfully',
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error deleting student mock answer',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get all student mock answers by user ID' })
    @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit for pagination' })
    @ApiResponse({ status: 200, description: 'List of student mock answers by user ID', type: StudentsMockAnswersResponseCountDto })
    @ApiResponse({ status: 500, description: 'Error fetching student mock answers by user ID', type: ResponseDto<null> })
    async findByUserId(@Param('userId') userId: string, @Query('offset') offset: number, @Query('limit') limit: number): Promise<StudentsMockAnswersResponseCountDto> {
        try {
            const x = await this.studentsMockAnswersService.findByUserId(userId, offset, limit);
            return {
                status: 200,
                data: x,
                message: 'Student mock answers fetched successfully',
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error fetching student mock answers',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Get('lesson/:lessonId/user/:userId')
    @ApiOperation({ summary: 'Get all student mock answers by lesson ID and user ID' })
    @ApiResponse({ status: 200, description: 'List of student mock answers by lesson ID and user ID', type: StudentsMockAnswersResponseCountDto })
    @ApiResponse({ status: 500, description: 'Error fetching student mock answers by lesson ID and user ID', type: ResponseDto<null> })
    async findByLessonAndUserId(@Param('lessonId') lessonId: string, @Param('userId') userId: string): Promise<StudentsMockAnswersResponseCountDto> {
        try {
            const x = await this.studentsMockAnswersService.findByLessonAndUserId(lessonId, userId);
            return {
                status: 200,
                data: x,
                message: 'Student mock answers fetched successfully',
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error fetching student mock answers',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Get('question/:mockQuestionId/user/:userId')
    @ApiOperation({ summary: 'Get a student mock answer by question ID and user ID' })
    @ApiResponse({ status: 200, description: 'The student mock answer', type: StudentsMockAnswersResponseDto })
    @ApiResponse({ status: 500, description: 'Error fetching student mock answer by question and user', type: ResponseDto<null> })
    async findByQuestionAndUserId(@Param('mockQuestionId') mockQuestionId: string, @Param('userId') userId: string): Promise<ResponseDto<StudentsMockAnswers>> {
        try {
            const x = await this.studentsMockAnswersService.findByMockQuestionAndUser(mockQuestionId, userId);
            return {
                status: 200,
                data: x,
                message: 'Student mock answer fetched successfully',
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error fetching student mock answer',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }
}