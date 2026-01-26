import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiBody } from '@nestjs/swagger';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { GoalsService } from '../services/goal.service';
import { CreateGoalDto } from '../dto/create-goal.dto';
import { UpdateGoalDto } from '../dto/update-goal.dto';
import { GoalArrayResponseDto, GoalResponseDto, ResponseDto } from 'src/shared-types/response.dto';
import stringify from "safe-stable-stringify";
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';

@ApiTags('Goals')
@Controller('goals')
export class GoalController {
  constructor(private readonly goalService: GoalsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new goal' })
  @ApiBody({ type: CreateGoalDto })
  @ApiResponse({ status: 201, description: 'Goal created successfully', type: GoalResponseDto })
  @ApiResponse({ status: 500, description: 'Error creating goal', type: ResponseDto })
    @UseGuards(JwtAuthGuard)
  async create(@Body() createGoalDto: CreateGoalDto, @UserId() userId: string) {
    try {
      const goal = await this.goalService.create(createGoalDto, userId);
      return {
        status: HttpStatus.CREATED,
        message: 'Goal created successfully',
        data: goal,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error creating goal',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all goals with optional search' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Goals retrieved successfully', type: GoalArrayResponseDto })
  @ApiResponse({ status: 500, description: 'Error retrieving goals', type: ResponseDto })
  async findAll(@Query('search') search?: string) {
    try {
      const goals = await this.goalService.findAll(search);
      return {
        status: HttpStatus.OK,
        message: 'Goals retrieved successfully',
        data: goals,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving goals',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a goal by ID' })
  @ApiResponse({ status: 200, description: 'Goal retrieved successfully', type: GoalResponseDto })
  @ApiResponse({ status: 500, description: 'Error retrieving goal', type: ResponseDto })
  async findOne(@Param('id') id: string) {
    try {
      const goal = await this.goalService.findOne(id);
      return {
        status: HttpStatus.OK,
        message: 'Goal retrieved successfully',
        data: goal,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving goal',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goal by ID' })
  @ApiBody({ type: UpdateGoalDto })
  @ApiResponse({ status: 200, description: 'Goal updated successfully', type: GoalResponseDto })
  @ApiResponse({ status: 500, description: 'Error updating goal', type: ResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    try {
      const updated = await this.goalService.update(id, updateGoalDto);
      return {
        status: HttpStatus.OK,
        message: 'Goal updated successfully',
        data: updated,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error updating goal',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a goal by ID' })
  @ApiResponse({ status: 200, description: 'Goal deleted successfully', type: GoalResponseDto })
  @ApiResponse({ status: 500, description: 'Error deleting goal', type: ResponseDto })
  async remove(@Param('id') id: string) {
    try {
      const removed = await this.goalService.remove(id);
      return {
        status: HttpStatus.OK,
        message: 'Goal deleted successfully',
        data: removed,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error deleting goal',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }


  @Post('user/link-one')
  @ApiOperation({ summary: 'Link a goal to a user' })
  @ApiBody({ schema: { example: { userId: '1', goalId: '2' } } })
  @ApiResponse({ status: 200, description: 'Goal linked to user successfully', type: GoalResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ResponseDto })
  async linkOne(@Body() body: { userId: string; goalId: string }) {
    try {
      const result = await this.goalService.linkOne(body.userId, body.goalId);
      return {
        status: HttpStatus.OK,
        message: 'Goal linked to user successfully',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }

  @Post('user/link-many')
  @ApiOperation({ summary: 'Link multiple goals to a user' })
  @ApiBody({ schema: { example: { userId: '1', goalIds: ['2', '3', '4'] } } })
  @ApiResponse({ status: 200, description: 'Goals linked to user successfully', type: GoalArrayResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ResponseDto })
  async linkMany(@Body() body: { userId: string; goalIds: string[] }) {
    try {
      const result = await this.goalService.linkMany(body.userId, body.goalIds);
      return {
        status: HttpStatus.OK,
        message: 'Goals linked to user successfully',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }

  @Delete('user/unlink-one')
  @ApiOperation({ summary: 'Unlink a goal from a user' })
  @ApiBody({ schema: { example: { userId: '1', goalId: '2' } } })
  @ApiResponse({ status: 200, description: 'Goal unlinked from user successfully', type: GoalResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ResponseDto })
    @UseGuards(JwtAuthGuard)
  async unlinkOne(@Body() body: { userId: string; goalId: string }) {
    try {
      const result = await this.goalService.unlinkOne(body.userId, body.goalId);
      return {
        status: HttpStatus.OK,
        message: 'Goal unlinked from user successfully',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }

  @Delete('user/unlink-many')
  @ApiOperation({ summary: 'Unlink multiple goals from a user' })
  @ApiBody({ schema: { example: { userId: '1', goalIds: ['2', '3', '4'] } } })
  @ApiResponse({ status: 200, description: 'Goals unlinked from user successfully', type: GoalArrayResponseDto })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ResponseDto })
    @UseGuards(JwtAuthGuard)
  async unlinkMany(@Body() body: { userId: string; goalIds: string[] }) {
    try {
      const result = await this.goalService.unlinkMany(body.userId, body.goalIds);
      return {
        status: HttpStatus.OK,
        message: 'Goals unlinked from user successfully',
        data: result,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all goals linked to a user' })
  @ApiResponse({ status: 200, description: 'Goals retrieved successfully', type: GoalArrayResponseDto })
  @ApiResponse({ status: 500, description: 'Error retrieving goals', type: ResponseDto })
  async getUserGoals(@Param('userId') userId: string) {
    try {
      const goals = await this.goalService.getUserGoals(userId);
      return {
        status: HttpStatus.OK,
        message: 'Goals retrieved successfully',
        data: goals,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving goals',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
