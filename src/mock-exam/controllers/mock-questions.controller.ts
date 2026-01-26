import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { MockQuestionsResponseCountDto, MockQuestionsResponseDto, ResponseDto } from 'src/shared-types/response.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import stringify from "safe-stable-stringify";
import { MockQuestionsService } from '../services/mock-questions.service';
import { CreateMockQuestionDto } from '../dtos/create-mock-questions.dto';
import { SearchMockQuestionDto } from '../dtos/search-mock-question.dto';
import { UpdateMockQuestionDto } from '../dtos/udpdate-mock-questions.dto';


@ApiTags('Mock Questions')
@Controller('mock-questions')
@UseGuards(JwtAuthGuard)
export class MockQuestionController {
    constructor(private readonly mockQuestionsService: MockQuestionsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new mock question' })
    @ApiBody({ type: CreateMockQuestionDto })
    @ApiResponse({ status: 201, description: 'The mock question has been successfully created.', type: MockQuestionsResponseDto })
    @ApiResponse({ status: 500, description: 'Error creating mock question', type: ResponseDto<null> })
    async create(@Body() createDto: CreateMockQuestionDto, @UserId() userId: string): Promise<MockQuestionsResponseDto> {
        try {
            const x = await this.mockQuestionsService.create(createDto, userId);
            return {
                status: 201,
                data: x,
                message: 'Mock question created successfully',
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error creating mock question',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all mock questions' })
    @ApiResponse({ status: 200, description: 'List of mock questions', type: MockQuestionsResponseCountDto })
    @ApiResponse({ status: 500, description: 'Error fetching mock questions', type: ResponseDto<null> })
    async findAll(
        @Query() searchDto: SearchMockQuestionDto
    ): Promise<MockQuestionsResponseCountDto> {
        try {
            const x = await this.mockQuestionsService.findAll(searchDto);
            return {
                status: 200,
                data: x,
                message: 'Mock questions fetched successfully',
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error fetching mock questions',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a mock question by ID' })
    @ApiResponse({ status: 200, description: 'The mock question', type: MockQuestionsResponseDto })
    @ApiResponse({ status: 404, description: 'Mock question not found', type: ResponseDto<null> })
    @ApiResponse({ status: 500, description: 'Error fetching mock question', type: ResponseDto<null> })
    async findById(@Param('id') id: string): Promise<MockQuestionsResponseDto> {
        try {
            const x = await this.mockQuestionsService.findById(id);
            if (!x) {
                return {
                    status: 404,
                    message: 'Mock question not found',
                    data: null,
                };
            }
            return {
                status: 200,
                data: x,
                message: 'Mock question fetched successfully',
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error fetching mock question',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a mock question by ID' })
    @ApiBody({ type: UpdateMockQuestionDto })
    @ApiResponse({ status: 200, description: 'The mock question has been successfully updated.', type: MockQuestionsResponseDto })
    @ApiResponse({ status: 404, description: 'Mock question not found', type: ResponseDto<null> })
    @ApiResponse({ status: 500, description: 'Error updating mock question', type: ResponseDto<null> })
    async update(@Param('id') id: string, @Body() updateDto: UpdateMockQuestionDto): Promise<MockQuestionsResponseDto> {
        try {
            const x = await this.mockQuestionsService.update(id, updateDto);
            if (!x) {
                return {
                    status: 404,
                    message: 'Mock question not found',
                    data: null,
                };
            }
            return {
                status: 200,
                data: x,
                message: 'Mock question updated successfully',
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error updating mock question',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a mock question by ID' })
    @ApiResponse({ status: 200, description: 'The mock question has been successfully deleted.', type: ResponseDto<null> })
    @ApiResponse({ status: 404, description: 'Mock question not found', type: ResponseDto<null> })
    @ApiResponse({ status: 500, description: 'Error deleting mock question', type: ResponseDto<null> })
    async delete(@Param('id') id: string): Promise<ResponseDto<null>> {
        try {
            const deleted = await this.mockQuestionsService.delete(id);
            if (!deleted) {
                return {
                    status: 404,
                    message: 'Mock question not found',
                    data: null,
                };
            }
            return {
                status: 200,
                message: 'Mock question deleted successfully',
                data: null,
            };
        } catch (error) {
            return {
                status: 500,
                message: 'Error deleting mock question',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

}