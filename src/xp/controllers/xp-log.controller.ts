import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpStatus,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { XpLogService } from '../services/xp-log.service';
import { JwtAuthGuard } from '../../auth/GuardsDecorMiddleware/jwt-auth.guard';
import { RolesGuard } from '../../auth/GuardsDecorMiddleware/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { XpLogQueryDto } from '../dto/xp-log-query.dto';

@ApiTags('XP Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('xp-logs')
export class XpLogController {
  constructor(private readonly xpLogService: XpLogService) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Get all XP logs as admin',
    description: 'Retrieve a paginated list of all user XP logs.',
  })
  async findAll(@Query() query: XpLogQueryDto) {
    const data = await this.xpLogService.findAll(query);
    return {
      status: HttpStatus.OK,
      message: 'XP logs retrieved successfully',
      data,
    };
  }

  @Delete('user/:userId/reset')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: "Reset a user's XP",
    description:
      'Deletes all XP logs for a user and resets their XP in the records.',
  })
  async resetUserXp(@Param('userId') userId: string) {
    try {
      await this.xpLogService.resetUserXp(userId);
      return {
        status: HttpStatus.OK,
        message: 'User XP reset successfully',
      };
    } catch (error: any) {
      return {
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to reset user XP',
      };
    }
  }
}
