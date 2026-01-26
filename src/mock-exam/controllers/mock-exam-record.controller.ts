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
import { MockExamRecordService } from '../services/mock-exam-record.service';
import { CreateMockExamRecordDto } from '../dtos/create-mock-exam-record.dto';
import { UpdateMockExamRecordDto } from '../dtos/update-mock-exam-record.dto';
import { SearchMockExamRecordDto } from '../dtos/search-mock-exam-record.dto';
import stringify from 'safe-stable-stringify';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { MockExamRecordResponseCountDto, MockExamRecordResponseDto} from 'src/shared-types/response.dto';

@ApiTags('Mock Exam Records')
@Controller('mock-exam-records')
@UseGuards(JwtAuthGuard)
export class MockExamRecordController {
    constructor(private readonly mockExamRecordService: MockExamRecordService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new mock exam record' })
    @ApiBody({ type: CreateMockExamRecordDto })
    @ApiResponse({ status: 201, description: 'Mock exam record created successfully', type: MockExamRecordResponseDto })
    @ApiResponse({ status: 500, description: 'Error creating mock exam record', type: MockExamRecordResponseDto })
    async create(@Body() createDto: CreateMockExamRecordDto, @UserId() userId: string): Promise<MockExamRecordResponseDto> {
        try {
            // You may want to get userId from request context
            const record = await this.mockExamRecordService.create(createDto, userId);
            return {
                status: HttpStatus.CREATED,
                message: 'Mock exam record created successfully',
                data: record,
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error creating mock exam record',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all mock exam records (optionally by search)' })
    @ApiQuery({ name: 'mockExamId', required: false, type: String })
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
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of items to return', example: 10 })
    @ApiResponse({ status: 200, description: 'Mock exam records retrieved successfully', type: MockExamRecordResponseCountDto })
    @ApiResponse({ status: 500, description: 'Error retrieving mock exam records', type: MockExamRecordResponseCountDto })
    async findAll(@Query() searchDto: SearchMockExamRecordDto): Promise<MockExamRecordResponseCountDto> {
        try {
            const records = await this.mockExamRecordService.findAllWithCount(searchDto);
            return {
                status: HttpStatus.OK,
                message: 'Mock exam records retrieved successfully',
                data: records,
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error retrieving mock exam records',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a mock exam record by ID' })
    @ApiParam({ name: 'id', description: 'Mock exam record ID' })
    @ApiResponse({ status: 200, description: 'Mock exam record retrieved successfully', type: MockExamRecordResponseDto  })
    @ApiResponse({ status: 404, description: 'Mock exam record not found', type: MockExamRecordResponseDto  })
    @ApiResponse({ status: 500, description: 'Error retrieving mock exam record', type: MockExamRecordResponseDto  })
    async findOne(@Param('id') id: string): Promise<MockExamRecordResponseDto> {
        try {
            const record = await this.mockExamRecordService.findOne(id);
            return {
                status: HttpStatus.OK,
                message: 'Mock exam record retrieved successfully',
                data: record,
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error retrieving mock exam record',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a mock exam record by ID' })
    @ApiParam({ name: 'id', description: 'Mock exam record ID' })
    @ApiBody({ type: UpdateMockExamRecordDto })
    @ApiResponse({ status: 200, description: 'Mock exam record updated successfully', type: MockExamRecordResponseDto })
    @ApiResponse({ status: 500, description: 'Error updating mock exam record', type: MockExamRecordResponseDto })
    async update(@Param('id') id: string, @Body() updateDto: UpdateMockExamRecordDto): Promise<MockExamRecordResponseDto> {
        try {
            const record = await this.mockExamRecordService.update(id, updateDto);
            return {
                status: HttpStatus.OK,
                message: 'Mock exam record updated successfully',
                data: record,
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error updating mock exam record',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Post('markCompleted/:id')
    @ApiOperation({ summary: 'Update a mock exam record by ID' })
    @ApiParam({ name: 'id', description: 'Mock exam record ID' })
    @ApiResponse({ status: 200, description: 'Mock exam record updated successfully', type: MockExamRecordResponseDto })
    @ApiResponse({ status: 500, description: 'Error updating mock exam record', type: MockExamRecordResponseDto })
    async updateCompletedMockExam(@Param('id') id: string): Promise<MockExamRecordResponseDto> {
        try {
            const record = await this.mockExamRecordService.updateCompleted(id);
            return {
                status: HttpStatus.OK,
                message: 'Mock exam record updated successfully',
                data: record,
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error updating mock exam record',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a mock exam record by ID' })
    @ApiParam({ name: 'id', description: 'Mock exam record ID' })
    @ApiResponse({ status: 200, description: 'Mock exam record deleted successfully', type: MockExamRecordResponseDto })
    @ApiResponse({ status: 500, description: 'Error deleting mock exam record', type: MockExamRecordResponseDto })
    async remove(@Param('id') id: string): Promise<MockExamRecordResponseDto> {
        try {
            await this.mockExamRecordService.remove(id);
            return {
                status: HttpStatus.OK,
                message: 'Mock exam record deleted successfully',
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error deleting mock exam record',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }
}
