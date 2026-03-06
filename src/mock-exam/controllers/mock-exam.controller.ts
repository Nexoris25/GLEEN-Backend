import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  MockExamCommentResponseDto,
  MockExamsResponseDto,
  ResponseDto,
} from 'src/shared-types/response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import stringify from 'safe-stable-stringify';
import { MockExamsService } from '../services/mock-exam.service';
import { CreateMockExamDto } from '../dtos/create-mock-exam.dto';
import { MockExams } from '../models/mock-exam.model';
import { SearchMockExamDto } from '../dtos/search-mock-exam.dto';
import { UpdateMockExamDto } from '../dtos/udpdate-mock-exam.dto';
import { MockExamComment } from '../models/mock-exam-comment.model';
import { UpdateMockExamCommentDto } from '../dtos/update-mock-exam-comment.dto';
import { CreateMockExamCommentDto } from '../dtos/create-mock-exam-comment.dto';

@ApiTags('Mock Exams')
@Controller('mock-exams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MockExamController {
  constructor(private readonly mockExamsService: MockExamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new mock exam' })
  @ApiBody({ type: CreateMockExamDto })
  @ApiResponse({
    status: 201,
    description: 'The mock exam has been successfully created.',
    type: MockExamsResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error creating mock exam',
    type: ResponseDto<null>,
  })
  async create(
    @Body() createDto: CreateMockExamDto,
    @UserId() userId: string,
  ): Promise<MockExamsResponseDto> {
    try {
      const x = await this.mockExamsService.create(createDto, userId);
      return {
        status: 201,
        data: x,
        message: 'Mock exam created successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error creating mock exam',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all mock exams' })
  @ApiResponse({
    status: 200,
    description: 'List of mock exams',
    type: ResponseDto<{ rows: MockExams[]; count: number }>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error fetching mock exams',
    type: ResponseDto<null>,
  })
  async findAll(
    @Query() searchDto: SearchMockExamDto,
  ): Promise<ResponseDto<{ rows: MockExams[]; count: number }>> {
    try {
      const x = await this.mockExamsService.findAll(searchDto);
      return {
        status: 200,
        data: x,
        message: 'Mock exams fetched successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error fetching mock exams',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a mock exam by ID' })
  @ApiResponse({
    status: 200,
    description: 'The mock exam',
    type: MockExamsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Mock exam not found',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error fetching mock exam',
    type: ResponseDto<null>,
  })
  async findById(@Param('id') id: string): Promise<MockExamsResponseDto> {
    try {
      const x = await this.mockExamsService.findById(id);
      if (!x) {
        return {
          status: 404,
          message: 'Mock exam not found',
          data: null,
        };
      }
      return {
        status: 200,
        data: x,
        message: 'Mock exam fetched successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error fetching mock exam',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a mock exam by ID' })
  @ApiBody({ type: UpdateMockExamDto })
  @ApiResponse({
    status: 200,
    description: 'The mock exam has been successfully updated.',
    type: MockExamsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Mock exam not found',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error updating mock exam',
    type: ResponseDto<null>,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMockExamDto,
  ): Promise<MockExamsResponseDto> {
    try {
      const x = await this.mockExamsService.update(id, updateDto);
      if (!x) {
        return {
          status: 404,
          message: 'Mock exam not found',
          data: null,
        };
      }
      return {
        status: 200,
        data: x,
        message: 'Mock exam updated successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error updating mock exam',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a mock exam by ID' })
  @ApiResponse({
    status: 200,
    description: 'The mock exam has been successfully deleted.',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    status: 404,
    description: 'Mock exam not found',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error deleting mock exam',
    type: ResponseDto<null>,
  })
  async delete(@Param('id') id: string): Promise<ResponseDto<null>> {
    try {
      const deleted = await this.mockExamsService.delete(id);
      if (!deleted) {
        return {
          status: 404,
          message: 'Mock exam not found',
          data: null,
        };
      }
      return {
        status: 200,
        message: 'Mock exam deleted successfully',
        data: null,
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error deleting mock exam',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  // Implement similar controller methods for MockExamComment and MockExamTracking

  @Post('comments')
  @ApiOperation({ summary: 'Create a mockExam comment' })
  @ApiParam({ name: 'id', description: 'MockExam ID' })
  @ApiBody({ type: CreateMockExamCommentDto })
  @ApiResponse({
    status: 201,
    description: 'MockExam comment created successfully',
    type: ResponseDto<MockExamComment>,
  })
  @ApiResponse({
    status: 404,
    description: 'MockExam not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error creating mockExam comment',
    type: ResponseDto,
  })
  async createComment(
    @Body() createCommentDto: CreateMockExamCommentDto,
    @UserId() userId: string,
  ): Promise<ResponseDto<MockExamComment>> {
    try {
      const comment = await this.mockExamsService.createComment(
        createCommentDto,
        userId,
      );
      return {
        status: 201,
        data: comment,
        message: 'MockExam comment created successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error creating mockExam comment',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('comments/:id')
  @ApiOperation({ summary: 'Get a mockExam comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({
    status: 200,
    description: 'MockExam comment retrieved successfully',
    type: ResponseDto<MockExamComment>,
  })
  @ApiResponse({
    status: 404,
    description: 'MockExam comment not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving mockExam comment',
    type: ResponseDto,
  })
  async getComment(
    @Param('id') id: string,
  ): Promise<ResponseDto<MockExamComment>> {
    try {
      const comment = await this.mockExamsService.findCommentById(id);
      return {
        status: 200,
        data: comment,
        message: 'MockExam comment retrieved successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error retrieving mockExam comment',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('comments/mockExam/:mockExamId')
  @ApiOperation({ summary: 'Get all comments for a mockExam by mockExam ID' })
  @ApiParam({ name: 'mockExamId', description: 'MockExam ID' })
  @ApiResponse({
    status: 200,
    description: 'MockExam comments retrieved successfully',
    type: ResponseDto<MockExamComment[]>,
  })
  @ApiResponse({
    status: 404,
    description: 'MockExam not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving mockExam comments',
    type: ResponseDto,
  })
  async getCommentsByMockExam(
    @Param('mockExamId') mockExamId: string,
  ): Promise<ResponseDto<MockExamComment[]>> {
    try {
      const comments =
        await this.mockExamsService.findCommentByMockExam(mockExamId);
      return {
        status: 200,
        data: comments,
        message: 'MockExam comments retrieved successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error retrieving mockExam comments',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('comments/mockExam/:mockExamId/user/:userId')
  @ApiOperation({ summary: 'Get mockExam comment by mockExam ID and user ID' })
  @ApiParam({ name: 'mockExamId', description: 'MockExam ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'MockExam comment retrieved successfully',
    type: ResponseDto<MockExamComment>,
  })
  @ApiResponse({
    status: 404,
    description: 'MockExam comment not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving mockExam comment',
    type: ResponseDto,
  })
  async getCommentByMockExamAndUser(
    @Param('mockExamId') mockExamId: string,
    @Param('userId') userId: string,
  ): Promise<ResponseDto<MockExamComment>> {
    try {
      const comment = await this.mockExamsService.findCommentByMockExamAndUser(
        mockExamId,
        userId,
      );
      return {
        status: 200,
        data: comment,
        message: 'MockExam comment retrieved successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error retrieving mockExam comment',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Put('comments/:id')
  @ApiOperation({ summary: 'Update a mockExam comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiBody({ type: UpdateMockExamCommentDto })
  @ApiResponse({
    status: 200,
    description: 'MockExam comment updated successfully',
    type: MockExamCommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'MockExam comment not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error updating mockExam comment',
    type: ResponseDto,
  })
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateMockExamCommentDto,
  ): Promise<MockExamCommentResponseDto> {
    try {
      const comment = await this.mockExamsService.updateComment(
        id,
        updateCommentDto,
      );
      return {
        status: 200,
        data: comment,
        message: 'MockExam comment updated successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error updating mockExam comment',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Delete a mockExam comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({
    status: 200,
    description: 'MockExam comment deleted successfully',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'MockExam comment not found',
    type: ResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error deleting mockExam comment',
    type: ResponseDto,
  })
  async removeComment(id: string): Promise<ResponseDto<null>> {
    try {
      await this.mockExamsService.removeComment(id);
      return {
        status: 200,
        data: null,
        message: 'MockExam comment deleted successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error deleting mockExam comment',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
