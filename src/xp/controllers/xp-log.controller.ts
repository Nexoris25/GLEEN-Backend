import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBody,
    ApiOkResponse,
    ApiNoContentResponse,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { XpLogService } from '../services/xp-log.service';
import { XpLog } from '../models/xp-log.model';
import { ResponseDto } from 'src/shared-types/response.dto';
import stringify from 'safe-stable-stringify';
import { CreateXpLogDto, UpdateXpLogDto, XpLogQueryDto } from '../dto/xp-log.dto';
import { XpSummaryResponseDto } from '../dto/xp-records.dto';

@ApiTags('XP Logs')
@Controller('xp-logs')
export class XpLogController {

    constructor(private readonly xpLogService: XpLogService) { }

    @Post()
    @ApiOperation({
        summary: 'Create XP log entry',
        description: 'Create a new XP log entry to track XP earnings.',
    })
    @ApiBody({
        type: CreateXpLogDto,
        description: 'XP log data',
    })
    @ApiResponse({
        description: 'XP log successfully created',
        type: ResponseDto<XpLog>,
    })
    async create(@Body() createXpLogDto: CreateXpLogDto): Promise<ResponseDto<XpLog>> {
        try {
            const data = await this.xpLogService.create(createXpLogDto);
            return { status: HttpStatus.OK, message: 'XP log created successfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error creating XP log', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Get()
    @ApiOperation({
        summary: 'Get all XP logs',
        description: 'Retrieve all XP logs with pagination and filtering options.',
    })
    @ApiQuery({
        type: XpLogQueryDto,
        required: false,
    })
    @ApiOkResponse({
        description: 'Successfully retrieved XP logs',
        type: ResponseDto<{ data: XpLog[]; total: number }>,
    })
    async findAll(@Query() queryDto?: XpLogQueryDto): Promise<ResponseDto<{ data: XpLog[]; total: number }>> {
        try {
            const data = await this.xpLogService.findAll(queryDto);
            return { status: HttpStatus.OK, message: 'XP logs retrieved successfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error retrieving XP logs', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get XP log by ID',
        description: 'Retrieve a specific XP log by its ID.',
    })
    @ApiParam({
        name: 'id',
        description: 'XP log UUID',
        type: String,
    })
    @ApiOkResponse({
        description: 'Successfully retrieved XP log',
        type: ResponseDto<XpLog>,
    })
    async findOne(@Param('id') id: string): Promise<ResponseDto<XpLog>> {
        try {
            const data = await this.xpLogService.findOne(id);
            return { status: HttpStatus.OK, message: 'XP log retrieved successfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error retrieving XP log', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Get('user/:userId')
    @ApiOperation({
        summary: 'Get XP logs by user ID',
        description: 'Retrieve all XP logs for a specific user.',
    })
    @ApiParam({
        name: 'userId',
        description: 'User UUID',
        type: String,
    })
    @ApiQuery({
        type: XpLogQueryDto,
        required: false,
    })
    @ApiOkResponse({
        description: 'Successfully retrieved user XP logs',
        type: ResponseDto<{ data: XpLog[]; total: number }>,
    })
    async findByUserId(
        @Param('userId') userId: string,
        @Query() queryDto?: XpLogQueryDto
    ): Promise<ResponseDto<{ data: XpLog[]; total: number }>> {
        try {
            const data = await this.xpLogService.findByUserId(userId, queryDto);
            return { status: HttpStatus.OK, message: 'User XP logs retrieved successfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error retrieving user XP logs', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Get('user/:userId/summary')
    @ApiOperation({
        summary: 'Get XP summary by user',
        description: 'Get total XP earned by type for a specific user.',
    })
    @ApiParam({
        name: 'userId',
        description: 'User UUID',
        type: String,
    })
    @ApiOkResponse({
        description: 'Successfully retrieved XP summary',
        type: ResponseDto<XpSummaryResponseDto[]>,
    })
    async getXpSummaryByUserId(@Param('userId') userId: string): Promise<ResponseDto<XpSummaryResponseDto[]>> {
        try {
            const data = await this.xpLogService.getXpSummaryByUserId(userId);
            return { status: HttpStatus.OK, message: 'XP summary retrieved successfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error retrieving XP summary', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Get('user/:userId/total')
    @ApiOperation({
        summary: 'Get total XP for user',
        description: 'Get total XP earned by a specific user.',
    })
    @ApiParam({
        name: 'userId',
        description: 'User UUID',
        type: String,
    })
    @ApiOkResponse({
        description: 'Successfully retrieved total XP',
        type: ResponseDto<{userId: string; totalXp: number}>,
    })
    async getTotalXpByUserId(@Param('userId') userId: string): Promise<ResponseDto<{userId: string; totalXp: number}>> {
        try {
            const totalXp = await this.xpLogService.getTotalXpByUserId(userId);
            const data = { userId, totalXp };
            return { status: HttpStatus.OK, message: 'Total XP retrieved successfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error retrieving total XP', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Update XP log',
        description: 'Update an existing XP log entry.',
    })
    @ApiParam({
        name: 'id',
        description: 'XP log UUID',
        type: String,
    })
    @ApiBody({
        type: UpdateXpLogDto,
        description: 'Partial XP log data for update',
    })
    @ApiResponse({
        description: 'XP log successfully updated',
        type: ResponseDto<XpLog>,
    })
    async update(
        @Param('id') id: string,
        @Body() updateXpLogDto: UpdateXpLogDto,
    ): Promise<ResponseDto<XpLog>> {
        try {
            const data = await this.xpLogService.update(id, updateXpLogDto);
            return { status: HttpStatus.OK, message: 'XP log updated successfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error updating XP log', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete XP log',
        description: 'Permanently delete an XP log entry.',
    })
    @ApiParam({
        name: 'id',
        description: 'XP log UUID',
        type: String,
    })
    @ApiNoContentResponse({
        description: 'XP log successfully deleted',
    })
    async remove(@Param('id') id: string): Promise<ResponseDto<null>> {
        try {
            await this.xpLogService.remove(id);
            return { status: HttpStatus.OK, message: 'XP log deleted successfully', data: null };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error deleting XP log', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }
}