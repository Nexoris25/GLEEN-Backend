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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ComplaintService } from '../services/complaint.service';
import {
  ComplaintArrayResponseCountDto,
  ComplaintResponseDto,
  CreateComplaintDto,
  UpdateComplaintDto,
} from '../dto/complaint.dto';
import stringify from 'safe-stable-stringify';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';

@ApiTags('Complaints')
@ApiBearerAuth()
@Controller('complaints')
@UseGuards(JwtAuthGuard)
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new complaint' })
  @ApiBody({ type: CreateComplaintDto })
  @ApiResponse({
    status: 201,
    description: 'Complaint created successfully',
    type: ComplaintResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(
    @Body() dto: CreateComplaintDto,
    @UserId() userId: string,
  ): Promise<ComplaintResponseDto> {
    try {
      const sub = await this.complaintService.create(dto, userId);
      return {
        status: HttpStatus.CREATED,
        message: 'Complaint created',
        data: sub,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to create complaint',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all complaints' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['open', 'in_progress', 'resolved'],
    description: 'Filter by complaint status',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by title or description',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
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
    description: 'List of complaints',
    type: ComplaintArrayResponseCountDto,
  })
  async findAll(@Query() query: any) {
    try {
      const sub = await this.complaintService.findAll(query);
      return {
        status: HttpStatus.OK,
        message: 'Complaints retrieved successfully',
        data: sub,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve complaints',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a complaint by ID' })
  @ApiParam({ name: 'id', description: 'Complaint ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Complaint found',
    type: ComplaintResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Complaint not found' })
  async findOne(@Param('id') id: string) {
    try {
      const sub = await this.complaintService.findOne(id);
      return {
        status: HttpStatus.OK,
        message: 'Complaint retrieved successfully',
        data: sub,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve complaint',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing complaint' })
  @ApiParam({ name: 'id', description: 'Complaint ID', type: String })
  @ApiBody({ type: UpdateComplaintDto })
  @ApiResponse({
    status: 200,
    description: 'Complaint updated successfully',
    type: ComplaintResponseDto,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateComplaintDto) {
    try {
      const sub = await this.complaintService.update(id, dto);
      return {
        status: HttpStatus.OK,
        message: 'Complaint updated successfully',
        data: sub,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update complaint',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a complaint by ID' })
  @ApiParam({ name: 'id', description: 'Complaint ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Complaint deleted successfully',
    type: ComplaintResponseDto,
  })
  async remove(@Param('id') id: string) {
    try {
      const sub = await this.complaintService.remove(id);
      return {
        status: HttpStatus.OK,
        message: 'Complaint deleted successfully',
        data: sub,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to delete complaint',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
