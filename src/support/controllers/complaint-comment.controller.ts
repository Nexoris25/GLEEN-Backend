import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ComplaintCommentService } from '../services/complaint-comment.service';
import {
  CreateComplaintCommentDto,
  UpdateComplaintCommentDto,
  ComplaintCommentResponseDto,
  ComplaintCommentArrayResponseDto,
} from '../dto/complaint-comment.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { stringify } from 'querystring';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';

@ApiTags('Complaint Comments')
@Controller('complaint-comments')
@UseGuards(JwtAuthGuard)
export class ComplaintCommentController {
  constructor(private readonly commentService: ComplaintCommentService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new comment to a complaint' })
  @ApiBody({ type: CreateComplaintCommentDto })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: ComplaintCommentResponseDto,
  })
  async create(
    @Body() dto: CreateComplaintCommentDto,
    @UserId() userId: string,
  ): Promise<ComplaintCommentResponseDto> {
    try {
      const sub: any = await this.commentService.create(dto, userId);
      return {
        status: HttpStatus.CREATED,
        message: 'Complaint created',
        data: sub,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to create comment',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all comments with optional filters' })
  @ApiQuery({
    name: 'complaintId',
    required: false,
    description: 'Filter by complaint ID',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search comment text',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Results per page',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Pagination offset',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Filtered comments',
    type: ComplaintCommentArrayResponseDto,
  })
  async findAll(@Query() query: any) {
    try {
      const sub = await this.commentService.findAll(query);
      return {
        status: HttpStatus.OK,
        message: 'Comments retrieved successfully',
        data: sub,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve comments',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single comment by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Comment ID' })
  @ApiResponse({ status: 200, type: ComplaintCommentResponseDto })
  async findOne(@Param('id') id: string) {
    try {
      const sub = await this.commentService.findOne(id);
      return {
        status: HttpStatus.OK,
        message: 'Comment retrieved successfully',
        data: sub,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve comment',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a complaint comment' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateComplaintCommentDto })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    type: ComplaintCommentResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateComplaintCommentDto,
  ) {
    try {
      const sub = await this.commentService.update(id, dto);
      return {
        status: HttpStatus.OK,
        message: 'Comment updated successfully',
        data: sub,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update comment',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully',
    type: ComplaintCommentResponseDto,
  })
  async remove(@Param('id') id: string) {
    try {
      const sub = await this.commentService.remove(id);
      return {
        status: HttpStatus.OK,
        message: 'Comment deleted successfully',
        data: sub,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to delete comment',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
