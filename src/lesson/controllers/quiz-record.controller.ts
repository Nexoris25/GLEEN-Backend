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
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { QuizRecordService } from '../services/quiz-record.service';
import { CreateQuizRecordDto } from '../dto/create-quiz-record.dto';
import { UpdateQuizRecordDto } from '../dto/update-quiz-record.dto';
import { SearchQuizRecordDto } from '../dto/search-quiz-record.dto';
import stringify from 'safe-stable-stringify';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { QuizRecordResponseCountDto, QuizRecordResponseDto } from 'src/shared-types/response.dto';

@ApiTags('Quiz Records')
@Controller('quiz-records')
@UseGuards(JwtAuthGuard)
export class QuizRecordController {
    constructor(private readonly quizRecordService: QuizRecordService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new quiz record' })
    @ApiBody({ type: CreateQuizRecordDto })
    @ApiResponse({ status: 201, description: 'Quiz record created successfully', type: QuizRecordResponseDto })
    @ApiResponse({ status: 500, description: 'Error creating quiz record', type: QuizRecordResponseDto })
    async create(@Body() createDto: CreateQuizRecordDto, @UserId() userId: string): Promise<QuizRecordResponseDto> {
        try {
            // You may want to get userId from request context
            const record = await this.quizRecordService.create(createDto, userId);
            return {
                status: HttpStatus.CREATED,
                message: 'Quiz record created successfully',
                data: record,
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error creating quiz record',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all quiz records (optionally by search)' })
    @ApiQuery({ name: 'quizId', required: false, type: String })
    @ApiQuery({ name: 'userId', required: false, type: String })
    @ApiQuery({ name: 'totalMarks', required: false, type: Number })
    @ApiQuery({ name: 'obtainedMarks', required: false, type: Number })
    @ApiQuery({ name: 'totalQuestions', required: false, type: Number })
    @ApiQuery({ name: 'totalAnsweredQuestions', required: false, type: Number })
    @ApiQuery({ name: 'totalUnansweredQuestions', required: false, type: Number })
    @ApiQuery({ name: 'correctAnswers', required: false, type: Number })
    @ApiQuery({ name: 'incorrectAnswers', required: false, type: Number })
    @ApiQuery({ name: 'endedAt', required: false, type: String })
    @ApiQuery({ name: 'startedAt', required: false, type: String })
    @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of items to skip', example: 0 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items to return', example: 10 })
    @ApiResponse({ status: 200, description: 'Quiz records retrieved successfully', type: QuizRecordResponseCountDto })
    @ApiResponse({ status: 500, description: 'Error retrieving quiz records', type: QuizRecordResponseCountDto })
    async findAll(@Query() searchDto: SearchQuizRecordDto): Promise<QuizRecordResponseCountDto> {
        try {
            const records = await this.quizRecordService.findAll(searchDto);
            return {
                status: HttpStatus.OK,
                message: 'Quiz records retrieved successfully',
                data: records,
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error retrieving quiz records',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a quiz record by ID' })
    @ApiParam({ name: 'id', description: 'Quiz record ID' })
    @ApiResponse({ status: 200, description: 'Quiz record retrieved successfully', type: QuizRecordResponseDto })
    @ApiResponse({ status: 404, description: 'Quiz record not found' })
    @ApiResponse({ status: 500, description: 'Error retrieving quiz record' })
    async findOne(@Param('id') id: string): Promise<QuizRecordResponseDto> {
        try {
            const record = await this.quizRecordService.findOne(id);
            return {
                status: HttpStatus.OK,
                message: 'Quiz record retrieved successfully',
                data: record,
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error retrieving quiz record',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a quiz record by ID' })
    @ApiParam({ name: 'id', description: 'Quiz record ID' })
    @ApiBody({ type: UpdateQuizRecordDto })
    @ApiResponse({ status: 200, description: 'Quiz record updated successfully', type: QuizRecordResponseDto })
    @ApiResponse({ status: 500, description: 'Error updating quiz record' })
    async update(@Param('id') id: string, @Body() updateDto: UpdateQuizRecordDto): Promise<QuizRecordResponseDto> {
        try {
            const record = await this.quizRecordService.update(id, updateDto);
            return {
                status: HttpStatus.OK,
                message: 'Quiz record updated successfully',
                data: record,
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error updating quiz record',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Post('markCompleted/:id')
    @ApiOperation({ summary: 'Update a quiz record by ID' })
    @ApiParam({ name: 'id', description: 'Quiz record ID' })
    @ApiResponse({ status: 200, description: 'Quiz record updated successfully', type: QuizRecordResponseDto })
    @ApiResponse({ status: 500, description: 'Error updating quiz record' })
    async updateCompleted(@Param('id') id: string): Promise<QuizRecordResponseDto> {
        try {
            const record = await this.quizRecordService.updateCompleted(id);
            return {
                status: HttpStatus.OK,
                message: 'Quiz record updated successfully',
                data: record,
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error updating quiz record',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a quiz record by ID' })
    @ApiParam({ name: 'id', description: 'Quiz record ID' })
    @ApiResponse({ status: 200, description: 'Quiz record deleted successfully' })
    @ApiResponse({ status: 500, description: 'Error deleting quiz record' })
    async remove(@Param('id') id: string): Promise<QuizRecordResponseDto> {
        try {
            await this.quizRecordService.remove(id);
            return {
                status: HttpStatus.OK,
                message: 'Quiz record deleted successfully',
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error deleting quiz record',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }
}
