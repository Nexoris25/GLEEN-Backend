import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MetricsService } from '../services/metrics.service';
import { MetricsResponseDto } from '../dto/metrics-response.dto';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { StudentGrowthResponseDto } from '../dto/student-growth.dto';

@ApiTags('Metrics')
@ApiBearerAuth()
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @ApiOperation({ summary: 'Get system metrics (admin only)' })
  @ApiResponse({ status: 200, type: MetricsResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'SUPER_ADMIN')

  @Get()
  async getMetrics() {
    return this.metricsService.getMetrics();
  }

  @ApiOperation({ summary: 'Get student growth for a date range (admin only)' })
  @ApiResponse({ status: 200, type: StudentGrowthResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'SUPER_ADMIN')
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @Get('student-growth')
  async getStudentGrowth(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.metricsService.getStudentGrowth({ startDate, endDate });
  }
}
