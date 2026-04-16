import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpStatus,
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
import { V1BattleRecordService } from '../services/v1-battle-record.service';
import { CreateV1BattleRecordDto } from '../dto/create-v1-battle-record.dto';
import { UpdateV1BattleRecordDto } from '../dto/update-v1-battle-record.dto';
import { SearchV1BattleRecordDto } from '../dto/search-v1-battle-record.dto';
import stringify from 'safe-stable-stringify';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import {
  V1BattleRecordResponseCountDto,
  V1BattleRecordResponseDto,
} from 'src/shared-types/response.dto';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';

@ApiTags('V1 Battle Record')
@ApiBearerAuth()
@Controller('v1-battle-record')
@UseGuards(JwtAuthGuard)
export class V1BattleRecordController {
  constructor(private readonly v1BattleRecordService: V1BattleRecordService) {}

  @Post()
  @ApiOperation({ summary: 'Create V1 Battle Record' })
  @ApiBody({ type: CreateV1BattleRecordDto })
  @ApiResponse({
    status: 201,
    description: 'Record created successfully',
    type: V1BattleRecordResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error creating record',
    type: V1BattleRecordResponseDto,
  })
  async create(
    @Body() createDto: CreateV1BattleRecordDto,
    @UserId() userId: string,
  ): Promise<V1BattleRecordResponseDto> {
    try {
      const record = await this.v1BattleRecordService.create(createDto, userId);
      return {
        status: HttpStatus.CREATED,
        message: 'Record created successfully',
        data: record,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error creating record',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all V1 Battle Records (optionally by search)' })
  @ApiQuery({ name: 'v1BattleId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Records retrieved successfully',
    type: V1BattleRecordResponseCountDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving records',
    type: V1BattleRecordResponseCountDto,
  })
  async findAll(
    @Query() searchDto: SearchV1BattleRecordDto,
  ): Promise<V1BattleRecordResponseCountDto> {
    try {
      const records = await this.v1BattleRecordService.findAll(searchDto);
      return {
        status: HttpStatus.OK,
        message: 'Records retrieved successfully',
        data: records,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving records',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get V1 Battle Record by ID' })
  @ApiParam({ name: 'id', description: 'Record ID' })
  @ApiResponse({
    status: 200,
    description: 'Record found',
    type: V1BattleRecordResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Record not found',
    type: V1BattleRecordResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving record',
    type: V1BattleRecordResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<V1BattleRecordResponseDto> {
    try {
      const record = await this.v1BattleRecordService.findOne(id);
      return {
        status: HttpStatus.OK,
        message: 'Record retrieved successfully',
        data: record,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving record',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update V1 Battle Record' })
  @ApiParam({ name: 'id', description: 'Record ID' })
  @ApiBody({ type: UpdateV1BattleRecordDto })
  @ApiResponse({
    status: 200,
    description: 'Record updated',
    type: V1BattleRecordResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error updating record',
    type: V1BattleRecordResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateV1BattleRecordDto,
  ): Promise<V1BattleRecordResponseDto> {
    try {
      const record = await this.v1BattleRecordService.update(id, updateDto);
      return {
        status: HttpStatus.OK,
        message: 'Record updated successfully',
        data: record,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error updating record',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('markCompleted/:id')
  @ApiOperation({ summary: 'Update V1 Battle Record' })
  @ApiParam({ name: 'id', description: 'Record ID' })
  @ApiResponse({
    status: 200,
    description: 'Record updated',
    type: V1BattleRecordResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error updating record',
    type: V1BattleRecordResponseDto,
  })
  async updateCompletedV1(
    @Param('id') id: string,
  ): Promise<V1BattleRecordResponseDto> {
    try {
      const record = await this.v1BattleRecordService.updateCompleted(id);
      return {
        status: HttpStatus.OK,
        message: 'Record updated successfully',
        data: record,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error updating record',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete V1 Battle Record' })
  @ApiParam({ name: 'id', description: 'Record ID' })
  @ApiResponse({
    status: 200,
    description: 'Record deleted',
    type: V1BattleRecordResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error deleting record',
    type: V1BattleRecordResponseDto,
  })
  async remove(@Param('id') id: string): Promise<V1BattleRecordResponseDto> {
    try {
      await this.v1BattleRecordService.remove(id);
      return {
        status: HttpStatus.OK,
        message: 'Record deleted successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error deleting record',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
