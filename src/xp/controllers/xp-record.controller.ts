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
import { XpRecordsService } from '../services/xp-records.service';
import { ResponseDto } from 'src/shared-types/response.dto';
import stringify from 'safe-stable-stringify';
import { AddXpDto, CreateXpRecordsDto, UpdateXpRecordsDto } from '../dto/xp-records.dto';
import { XpRecords } from '../models/xp-record.model';
import { LeaderboardQueryDto } from '../dto/xp-log.dto';

@ApiTags('XP Records')
@Controller('xp-records')
export class XpRecordsController {

    constructor(private readonly xpRecordsService: XpRecordsService) { }

    @Post()
    @ApiOperation({
        summary: 'Create XP record',
        description: 'Create a new XP record for a user.',
    })
    @ApiBody({
        type: CreateXpRecordsDto,
        description: 'XP record data',
    })
    @ApiResponse({
        description: 'XP record successfully created',
        type: ResponseDto<XpRecords>,
    })
    async create(@Body() createXpRecordsDto: CreateXpRecordsDto): Promise<ResponseDto<XpRecords>> {
        try {
            const data = await this.xpRecordsService.create(createXpRecordsDto);
            return { status: HttpStatus.OK, message: 'XP record created successfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error creating XP record', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Post('user/:userId/add-xp')
    @ApiOperation({
        summary: 'Add XP to user',
        description: 'Add XP to a user\'s record. Creates a new record if none exists.',
    })
    @ApiParam({
        name: 'userId',
        description: 'User UUID',
        type: String,
    })
    @ApiBody({
        type: AddXpDto,
        description: 'XP data to add',
    })
    @ApiResponse({
        description: 'XP successfully added to user',
        type: ResponseDto<XpRecords>,
    })
    async addXp(
        @Param('userId') userId: string,
        @Body() addXpDto: AddXpDto
    ): Promise<ResponseDto<XpRecords>> {
        try {
            const data = await this.xpRecordsService.addXp(userId, addXpDto);
            return { status: HttpStatus.OK, message: 'XP added successfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error adding XP', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Get()
    @ApiOperation({
        summary: 'Get all XP records',
        description: 'Retrieve all XP records for all users.',
    })
    @ApiOkResponse({
        description: 'Successfully retrieved XP records',
        type: ResponseDto<XpRecords[]>,
    })
    async findAll(): Promise<ResponseDto<XpRecords[]>> {
        try {
            const data = await this.xpRecordsService.findAll();
            return { status: HttpStatus.OK, message: 'XP records retrieved successfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error retrieving XP records', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Get('leaderboard')
    @ApiOperation({
        summary: 'Get XP leaderboard',
        description: 'Get top users by XP (leaderboard).',
    })
    @ApiQuery({
        type: LeaderboardQueryDto,
        required: false,
    })
    @ApiOkResponse({
        description: 'Successfully retrieved leaderboard',
        type: ResponseDto<XpRecords[]>,
    })
    async getLeaderboard(@Query() queryDto?: LeaderboardQueryDto): Promise<ResponseDto<XpRecords[]>> {
        try {
            const data = await this.xpRecordsService.getLeaderboard(queryDto);
            return { 
                status: HttpStatus.OK, 
                message: 'Leaderboard retrieved successfully', 
                data: data
            };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error retrieving leaderboard', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get XP record by ID',
        description: 'Retrieve a specific XP record by its ID.',
    })
    @ApiParam({
        name: 'id',
        description: 'XP record UUID',
        type: String,
    })
    @ApiOkResponse({
        description: 'Successfully retrieved XP record',
        type: ResponseDto<XpRecords>,
    })
    async findOne(@Param('id') id: string): Promise<ResponseDto<XpRecords>> {
        try {
            const data = await this.xpRecordsService.findOne(id);
            return { status: HttpStatus.OK, message: 'XP record retrieved successfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error retrieving XP record', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Get('user/:userId')
    @ApiOperation({
        summary: 'Get XP record by user ID',
        description: 'Retrieve XP record for a specific user.',
    })
    @ApiParam({
        name: 'userId',
        description: 'User UUID',
        type: String,
    })
    @ApiOkResponse({
        description: 'Successfully retrieved user XP record',
        type: ResponseDto<XpRecords>,
    })
    async findByUserId(@Param('userId') userId: string): Promise<ResponseDto<XpRecords>> {
        try {
            const data = await this.xpRecordsService.findByUserId(userId);
            return { status: HttpStatus.OK, message: 'User XP record retrieved successfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error retrieving user XP record', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Get('user/:userId/current')
    @ApiOperation({
        summary: 'Get current XP for user',
        description: 'Get current XP value for a specific user.',
    })
    @ApiParam({
        name: 'userId',
        description: 'User UUID',
        type: String,
    })
    @ApiOkResponse({
        description: 'Successfully retrieved current XP',
        type: ResponseDto<{ userId: string; currentXp: number }>,
    })
    async getCurrentXp(@Param('userId') userId: string): Promise<ResponseDto<{ userId: string; currentXp: number }>> {
        try {
            const currentXp = await this.xpRecordsService.getCurrentXp(userId);
            const data = { userId, currentXp };
            return { status: HttpStatus.OK, message: 'Current XP retrieved successfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error retrieving current XP', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Patch('user/:userId')
    @ApiOperation({
        summary: 'Update XP record by user ID',
        description: 'Update XP record for a specific user.',
    })
    @ApiParam({
        name: 'userId',
        description: 'User UUID',
        type: String,
    })
    @ApiBody({
        type: UpdateXpRecordsDto,
        description: 'Partial XP record data for update',
    })
    @ApiResponse({
        description: 'XP record successfully updated',
        type: ResponseDto<XpRecords>,
    })
    async updateByUserId(
        @Param('userId') userId: string,
        @Body() updateXpRecordsDto: UpdateXpRecordsDto,
    ): Promise<ResponseDto<XpRecords>> {
        try {
            const data = await this.xpRecordsService.updateByUserId(userId, updateXpRecordsDto);
            return { status: HttpStatus.OK, message: 'XP record updated successfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error updating XP record', error: stringify({
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
        summary: 'Delete XP record by ID',
        description: 'Permanently delete an XP record.',
    })
    @ApiParam({
        name: 'id',
        description: 'XP record UUID',
        type: String,
    })
    @ApiNoContentResponse({
        description: 'XP record successfully deleted',
    })
    async remove(@Param('id') id: string): Promise<ResponseDto<null>> {
        try {
            await this.xpRecordsService.remove(id);
            return { status: HttpStatus.OK, message: 'XP record deleted successfully', data: null };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error deleting XP record', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Delete('user/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete XP record by user ID',
        description: 'Permanently delete XP record for a specific user.',
    })
    @ApiParam({
        name: 'userId',
        description: 'User UUID',
        type: String,
    })
    @ApiNoContentResponse({
        description: 'XP record successfully deleted',
    })
    async removeByUserId(@Param('userId') userId: string): Promise<ResponseDto<null>> {
        try {
            await this.xpRecordsService.removeByUserId(userId);
            return { status: HttpStatus.OK, message: 'User XP record deleted successfully', data: null };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error deleting user XP record', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }
}