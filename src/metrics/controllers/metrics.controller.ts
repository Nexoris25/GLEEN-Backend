import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetricsService } from '../services/metrics.service';
import { MetricsResponseDto } from '../dto/metrics-response.dto';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

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
}
