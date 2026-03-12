import {
  Controller,
  Get,
  HttpStatus,
  UseGuards,
  Query,
  Body,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { XpConfigurationService } from '../services/xp-configuration.service';
import { XpConfiguration } from '../models/xp-configuration.model';
import { UpdateXpConfigurationDto } from '../dto/update-xp-configuration.dto';
import { ResponseDto } from 'src/shared-types/response.dto';
import stringify from 'safe-stable-stringify';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { XpLogService } from '../services/xp-log.service';
import {
  XpRewardStoreAnalyticsResponseDto,
  XpStatisticsQueryDto,
  XpStatisticsResponseDto,
} from '../dto/xp-statistics.dto';
import { UpdateXpConversionDto } from '../dto/update-xp-conversion.dto';
import { StreakConfigurationService } from '../services/streak-configuration.service';
import { UpdateStreakConfigurationDto } from '../dto/update-streak-configuration.dto';

@ApiTags('XP Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('xp-configuration')
export class XpConfigurationController {
  constructor(
    private readonly xpConfigurationService: XpConfigurationService,
    private readonly xpLogService: XpLogService,
    private readonly streakConfigurationService: StreakConfigurationService,
  ) {}

  @Get('streak-settings')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Get streak rules and milestone rewards',
    description: 'Retrieve current streak configuration and rewards.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved streak settings',
  })
  async getStreakSettings() {
    try {
      const data = await this.streakConfigurationService.findOne();
      return {
        status: HttpStatus.OK,
        message: 'Streak settings retrieved successfully',
        data,
      };
    } catch (error: any) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error retrieving streak settings',
        error: stringify({
          message: (error as Error)?.message || 'Unknown error',
          stack: (error as Error)?.stack,
          details: (error as any)?.response || error,
        }),
      };
    }
  }

  @Patch('streak-settings')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Update streak rules and milestone rewards',
    description:
      'Update streak trigger, time window, grace days, and milestone rewards.',
  })
  @ApiBody({
    type: UpdateStreakConfigurationDto,
  })
  @ApiOkResponse({
    description: 'Streak settings successfully updated',
  })
  async updateStreakSettings(@Body() updateDto: UpdateStreakConfigurationDto) {
    try {
      const data = await this.streakConfigurationService.update(updateDto);
      return {
        status: HttpStatus.OK,
        message: 'Streak settings updated successfully',
        data,
      };
    } catch (error: any) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error updating streak settings',
        error: stringify({
          message: (error as Error)?.message || 'Unknown error',
          stack: (error as Error)?.stack,
          details: (error as any)?.response || error,
        }),
      };
    }
  }

  @Get('reward-store-analytics')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Get XP reward store analytics',
    description:
      'Retrieve analytics for XP conversions and rewards, including total converted, average daily conversion, and usage over time.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved reward store analytics',
    type: ResponseDto<XpRewardStoreAnalyticsResponseDto>,
  })
  async getRewardStoreAnalytics(
    @Query() query: XpStatisticsQueryDto,
  ): Promise<ResponseDto<XpRewardStoreAnalyticsResponseDto>> {
    try {
      const data = await this.xpLogService.getRewardStoreAnalytics(query);
      return {
        status: HttpStatus.OK,
        message: 'Reward store analytics retrieved successfully',
        data,
      };
    } catch (error: any) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error retrieving reward store analytics',
        error: stringify({
          message: (error as Error)?.message || 'Unknown error',
          stack: (error as Error)?.stack,
          details: (error as any)?.response || error,
        }),
      };
    }
  }

  @Patch('conversion-settings')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Update XP conversion settings for airtime and subscriptions',
    description:
      'Set XP limits for airtime conversion and required XP for subscription plans.',
  })
  @ApiBody({
    type: UpdateXpConversionDto,
    description: 'XP conversion configuration data',
  })
  @ApiResponse({
    description: 'XP conversion settings successfully updated',
    type: ResponseDto<XpConfiguration>,
  })
  async updateConversionSettings(
    @Body() updateDto: UpdateXpConversionDto,
  ): Promise<ResponseDto<XpConfiguration>> {
    try {
      const data = await this.xpConfigurationService.update(updateDto);
      return {
        status: HttpStatus.OK,
        message: 'XP conversion settings updated successfully',
        data: data,
      };
    } catch (error: any) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error updating XP conversion settings',
        error: stringify({
          message: (error as Error)?.message || 'Unknown error',
          stack: (error as Error)?.stack,
          details: (error as any)?.response || error,
        }),
      };
    }
  }

  @Get('statistics')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Get XP statistics',
    description:
      'Retrieve XP statistics including total issued, average per user, and XP by action.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved XP statistics',
    type: ResponseDto<XpStatisticsResponseDto>,
  })
  async getStatistics(
    @Query() query: XpStatisticsQueryDto,
  ): Promise<ResponseDto<XpStatisticsResponseDto>> {
    try {
      const data = await this.xpLogService.getXpStatistics(query);
      return {
        status: HttpStatus.OK,
        message: 'XP statistics retrieved successfully',
        data: data,
      };
    } catch (error: any) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error retrieving XP statistics',
        error: stringify({
          message: (error as Error)?.message || 'Unknown error',
          stack: (error as Error)?.stack,
          details: (error as any)?.response || error,
        }),
      };
    }
  }
  /*
    @Post()
    @ApiOperation({
        summary: 'Create XP configuration',
        description: 'Create the single XP configuration for the system. This can only be done once.',
    })
    @ApiBody({
        type: CreateXpConfigurationDto,
        description: 'XP configuration data',
    })
    @ApiResponse({
        description: 'XP configuration successfully created',
        type: ResponseDto<XpConfiguration>,
    })
    async create(@Body() createXpConfigurationDto: CreateXpConfigurationDto): Promise<ResponseDto<XpConfiguration>> {
        try {
            const data = await this.xpConfigurationService.create(createXpConfigurationDto);
            return { status: HttpStatus.OK, message: 'xp configuarion created sucessfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error creating xp configuration', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }

    @Post('initialize-default')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Initialize default configuration',
        description: 'Initialize the system with default XP configuration values if none exists.',
    })
    @ApiResponse({
        description: 'Default XP configuration initialized or already exists',
        type: ResponseDto<XpConfiguration>,
    })
    async initializeDefaultConfiguration(): Promise<ResponseDto<XpConfiguration>> {
        try {
            const data = await this.xpConfigurationService.initializeDefaultConfiguration();
            return { status: HttpStatus.OK, message: 'xp configuarion created sucessfully', data: data };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error creating xp configuration', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }
*/
  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN', 'TUTOR', 'USER')
  @ApiOperation({
    summary: 'Get XP configuration',
    description: 'Retrieve the single XP configuration for the system.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved XP configuration',
    type: ResponseDto<XpConfiguration>,
  })
  async findOne(): Promise<ResponseDto<XpConfiguration>> {
    try {
      const data = await this.xpConfigurationService.findOne();
      return {
        status: HttpStatus.OK,
        message: 'xp configuarion retrived sucessfully',
        data: data,
      };
    } catch (error: any) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error retreiviing xp configuration',
        error: stringify({
          message: (error as Error)?.message || 'Unknown error',
          stack: (error as Error)?.stack,
          details: (error as any)?.response || error,
        }),
      };
    }
  }

  @Patch()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Update XP configuration. Admin, Super Admin',
    description: 'Update the single XP configuration for the system.',
  })
  @ApiBody({
    type: UpdateXpConfigurationDto,
    description: 'Partial XP configuration data for update',
  })
  @ApiResponse({
    description: 'XP configuration successfully updated',
    type: ResponseDto<XpConfiguration>,
  })
  async update(
    @Body() updateXpConfigurationDto: UpdateXpConfigurationDto,
  ): Promise<ResponseDto<XpConfiguration>> {
    try {
      const data = await this.xpConfigurationService.update(
        updateXpConfigurationDto,
      );
      return {
        status: HttpStatus.OK,
        message: 'xp configuarion updated sucessfully',
        data: data,
      };
    } catch (error: any) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error updating xp configuration',
        error: stringify({
          message: (error as Error)?.message || 'Unknown error',
          stack: (error as Error)?.stack,
          details: (error as any)?.response || error,
        }),
      };
    }
  }

  /*

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete XP configuration',
        description: 'Permanently delete the XP configuration. Use with caution.',
    })
    @ApiNoContentResponse({
        description: 'XP configuration successfully deleted',
    })
    async remove(@Param('id') id: string): Promise<ResponseDto<null>> {
        try {
            await this.xpConfigurationService.remove(id);
            return { status: HttpStatus.OK, message: 'xp configuarion deleted sucessfully', data: null };
        } catch (error) {
            return {
                status: HttpStatus.BAD_REQUEST, message: 'Error deleting xp configuration', error: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                })
            };
        }
    }
    */
}
