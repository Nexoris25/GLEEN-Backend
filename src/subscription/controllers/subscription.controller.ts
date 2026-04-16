import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SubscriptionService } from '../services/subscription.service';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from '../dto/subscription.dto';
import { Subscription } from '../models/Subscription.model';
import stringify from 'safe-stable-stringify';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import {
  ResponseDto,
  SubscriptionResponseDto,
  SubscriptionResponseCountDto,
} from 'src/shared-types/response.dto';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  /*
  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiBody({ type: CreateSubscriptionDto })
  @ApiResponse({ status: 201, description: 'Subscription created', type: SubscriptionResponseDto })
  @ApiResponse({ status: 400, description: 'Error creating subscription', type: ResponseDto<null> })
  async create(@Body() dto: CreateSubscriptionDto, @UserId() userId: string): Promise<ResponseDto<Subscription>> {
    try {
      const sub = await this.subscriptionService.create(dto, userId);
      return { status: HttpStatus.CREATED, message: 'Subscription created', data: sub };
    } catch (error) {
      return { status: HttpStatus.BAD_REQUEST, message: 'Error creating subscription', error: stringify(error) };
    }
  }
*/
  @Get()
  @ApiOperation({ summary: 'Get all subscriptions (paginated)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Subscriptions fetched',
    type: SubscriptionResponseCountDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Error fetching subscriptions',
    type: ResponseDto<null>,
  })
  async findAll(
    @Query('offset') offset = 0,
    @Query('limit') limit = 10,
  ): Promise<SubscriptionResponseCountDto | ResponseDto<null>> {
    try {
      // Call service WITHOUT userId to fetch all subscriptions
      const result = await this.subscriptionService.findAllAllUsers(
        offset,
        limit,
      );

      return {
        status: HttpStatus.OK,
        message: 'Subscriptions fetched',
        data: { count: result.count, rows: result.rows },
      };
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error fetching subscriptions',
        error: stringify(error),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by id' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription retrieved',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription not found',
    type: ResponseDto<null>,
  })
  async findOne(
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<ResponseDto<Subscription>> {
    try {
      const sub = await this.subscriptionService.findOne(id, userId);
      return {
        status: HttpStatus.OK,
        message: 'Subscription retrieved',
        data: sub,
      };
    } catch (error) {
      const code = error.status || HttpStatus.BAD_REQUEST;
      return {
        status: code,
        message: error.message,
        error: error.details || stringify(error),
      };
    }
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update subscription by id: ADMIN, SUPER_ADMIN' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiBody({ type: UpdateSubscriptionDto })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Error updating subscription',
    type: ResponseDto<null>,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
    @UserId() userId: string,
  ): Promise<ResponseDto<Subscription>> {
    try {
      const sub = await this.subscriptionService.update(id, dto, userId);
      return {
        status: HttpStatus.OK,
        message: 'Subscription updated',
        data: sub,
      };
    } catch (error) {
      const code = error.status || HttpStatus.BAD_REQUEST;
      return { status: code, message: error.message, error: stringify(error) };
    }
  }

  /*
  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscription by id' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription deleted' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async remove(@Param('id') id: string, @UserId() userId: string): Promise<ResponseDto<null>>   {
    try {
      await this.subscriptionService.remove(id, userId);
      return { status: HttpStatus.OK, message: 'Subscription deleted' };
    } catch (error) {
      const code = error.status || HttpStatus.BAD_REQUEST;
      return { status: code, message: error.message, error: stringify(error) };
    }
  }
  */
}
