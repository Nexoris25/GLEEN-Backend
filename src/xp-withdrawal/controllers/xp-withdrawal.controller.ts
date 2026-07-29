import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import stringify from 'safe-stable-stringify';
import { XpWithdrawalService } from '../services/xp-withdrawal.service';
import { CreateXpWithdrawalDto } from '../dto/create-xp-withdrawal.dto';
import { ProcessXpWithdrawalDto } from '../dto/process-xp-withdrawal.dto';
import { ListXpWithdrawalQueryDto } from '../dto/list-xp-withdrawal-query.dto';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';

@ApiTags('XP Withdrawal')
@ApiBearerAuth()
@Controller('xp-withdrawals')
export class XpWithdrawalController {
  constructor(private readonly xpWithdrawalService: XpWithdrawalService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Request an XP → airtime withdrawal' })
  @ApiBody({ type: CreateXpWithdrawalDto })
  @ApiResponse({ status: 201, description: 'Withdrawal request created' })
  async create(@UserId() userId: string, @Body() dto: CreateXpWithdrawalDto) {
    try {
      const data = await this.xpWithdrawalService.create(userId, dto);
      return {
        status: HttpStatus.CREATED,
        message: 'Withdrawal request submitted successfully',
        data,
      };
    } catch (error: any) {
      return {
        status: error?.status || HttpStatus.BAD_REQUEST,
        message: error?.message || 'Error creating withdrawal request',
        error: stringify({ message: error?.message, ...error }),
      };
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get the current user's withdrawal history" })
  async findMine(@UserId() userId: string) {
    try {
      const data = await this.xpWithdrawalService.findMine(userId);
      return {
        status: HttpStatus.OK,
        message: 'Withdrawal history retrieved successfully',
        data,
      };
    } catch (error: any) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error retrieving withdrawal history',
        error: stringify({ message: error?.message, ...error }),
      };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List all withdrawal requests (admin)' })
  async findAll(@Query() query: ListXpWithdrawalQueryDto) {
    try {
      const result = await this.xpWithdrawalService.findAllForAdmin(query);
      return {
        status: HttpStatus.OK,
        message: 'Withdrawal requests retrieved successfully',
        data: result.rows,
        total: result.count,
      };
    } catch (error: any) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error retrieving withdrawal requests',
        error: stringify({ message: error?.message, ...error }),
      };
    }
  }

  @Patch(':id/process')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Mark a withdrawal SENT, or DECLINED with a reason (admin)',
  })
  @ApiBody({ type: ProcessXpWithdrawalDto })
  async process(
    @Param('id') id: string,
    @UserId() adminUserId: string,
    @Body() dto: ProcessXpWithdrawalDto,
  ) {
    try {
      const data = await this.xpWithdrawalService.process(id, adminUserId, dto);
      return {
        status: HttpStatus.OK,
        message: `Withdrawal request ${dto.status.toLowerCase()} successfully`,
        data,
      };
    } catch (error: any) {
      return {
        status: error?.status || HttpStatus.BAD_REQUEST,
        message: error?.message || 'Error processing withdrawal request',
        error: stringify({ message: error?.message, ...error }),
      };
    }
  }
}
