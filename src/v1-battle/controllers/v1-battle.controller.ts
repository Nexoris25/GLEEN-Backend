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
import { V1BattleService } from '../services/v1-battle.service';
import { CreateV1BattleDto } from '../dto/create-v1-battle.dto';
import { UpdateV1BattleDto } from '../dto/update-v1-battle.dto';
import { SearchV1BattleDto } from '../dto/search-v1-battle.dto';
import stringify from 'safe-stable-stringify';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { ResponseDto, V1BattleResponseCountDto, V1BattleResponseDto } from 'src/shared-types/response.dto';

@ApiTags('V1 Battle')
@Controller('v1-battle')
@UseGuards(JwtAuthGuard)
export class V1BattleController {
    constructor(private readonly v1BattleService: V1BattleService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new battle' })
    @ApiBody({ type: CreateV1BattleDto })
    @ApiResponse({ status: 201, description: 'Battle created successfully', type: V1BattleResponseDto })
    @ApiResponse({ status: 500, description: 'Error creating battle', type: ResponseDto })
    async create(@Body() createDto: CreateV1BattleDto, @UserId() userId: string): Promise<V1BattleResponseDto> {
        try {
            // You may want to get userId from request context
            const battle = await this.v1BattleService.create(createDto, userId);
            return {
                status: HttpStatus.CREATED,
                message: 'Battle created successfully',
                data: battle,
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error creating battle',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all battles (optionally by search)' })
    @ApiQuery({ name: 'duration', required: false, type: String })
    @ApiQuery({ name: 'subjectId', required: false, type: String })
    @ApiQuery({ name: 'quizId', required: false, type: String })
    @ApiQuery({ name: 'userId', required: false, type: String })
    @ApiQuery({ name: 'winnerUserId', required: false, type: String })
    @ApiQuery({ name: 'opponentUserId', required: false, type: String })
    @ApiQuery({ name: 'offset', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Battles retrieved successfully', type: V1BattleResponseCountDto })
    @ApiResponse({ status: 500, description: 'Error retrieving battles', type: ResponseDto })
    async findAll(@Query() searchDto: SearchV1BattleDto): Promise<V1BattleResponseCountDto> {
        try {
            const battles = await this.v1BattleService.findAll(searchDto);
            return {
                status: HttpStatus.OK,
                message: 'Battles retrieved successfully',
                data: battles,
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error retrieving battles',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a battle by ID' })
    @ApiParam({ name: 'id', description: 'Battle ID' })
    @ApiResponse({ status: 200, description: 'Battle retrieved successfully', type: V1BattleResponseDto })
    @ApiResponse({ status: 404, description: 'Battle not found', type: ResponseDto })
    @ApiResponse({ status: 500, description: 'Error retrieving battle', type: ResponseDto })
    async findOne(@Param('id') id: string): Promise<V1BattleResponseDto> {
        try {
            const battle = await this.v1BattleService.findOne(id);
            return {
                status: HttpStatus.OK,
                message: 'Battle retrieved successfully',
                data: battle,
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error retrieving battle',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a battle by ID' })
    @ApiParam({ name: 'id', description: 'Battle ID' })
    @ApiBody({ type: UpdateV1BattleDto })
    @ApiResponse({ status: 200, description: 'Battle updated successfully', type: V1BattleResponseDto })
    @ApiResponse({ status: 500, description: 'Error updating battle', type: ResponseDto })
    async update(@Param('id') id: string, @Body() updateDto: UpdateV1BattleDto): Promise<V1BattleResponseDto> {
        try {
            const battle = await this.v1BattleService.update(id, updateDto);
            return {
                status: HttpStatus.OK,
                message: 'Battle updated successfully',
                data: battle,
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error updating battle',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a battle by ID' })
    @ApiParam({ name: 'id', description: 'Battle ID' })
    @ApiResponse({ status: 200, description: 'Battle deleted successfully', type: ResponseDto })
    @ApiResponse({ status: 500, description: 'Error deleting battle', type: ResponseDto })
    async remove(@Param('id') id: string): Promise<ResponseDto<null>> {
        try {
            await this.v1BattleService.remove(id);
            return {
                status: HttpStatus.OK,
                message: 'Battle deleted successfully',
            };
        } catch (error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error deleting battle',
                error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            };
        }
    }
}
