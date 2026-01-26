import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { LgaService } from '../services/lga.service';
import { CreateLgaDto } from '../dto/create-lga.dto';
import { UpdateLgaDto } from '../dto/update-lga.dto';

import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('LGAs')
@Controller('lgas')
export class LgaController {
  constructor(private readonly lgaService: LgaService) {}

  // --------------------
  // Create LGA (Admin only)
  // --------------------
  /*
  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a new LGA (Admin only)' })
  @ApiResponse({ status: 201, description: 'LGA created successfully.' })
  @ApiResponse({ status: 404, description: 'State not found.' })
  create(@Body() dto: CreateLgaDto) {
    return this.lgaService.create(dto);
  }
*/
  // --------------------
  // Get all LGAs (pagination)
  // --------------------
  @Get()
  @ApiOperation({ summary: 'Get all LGAs with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'List of LGAs returned' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.lgaService.findAll(+page, +limit);
  }


  
    // --------------------
  // Get all LGAs by stateId
  // --------------------
  @Get('state/:stateId')
  @ApiOperation({ summary: 'Get all LGAs belonging to a specific state' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'List of LGAs returned' })
  @ApiResponse({ status: 404, description: 'State not found' })
  findByState(
    @Param('stateId') stateId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    return this.lgaService.findByState(stateId, +page, +limit);
  }
  
  // --------------------
  // Get single LGA
  // --------------------
  @Get(':id')
  @ApiOperation({ summary: 'Get a single LGA by ID' })
  @ApiResponse({ status: 200, description: 'LGA found' })
  @ApiResponse({ status: 404, description: 'LGA not found' })
  findOne(@Param('id') id: string) {
    return this.lgaService.findOne(id);
  }

  /*
  // --------------------
  // Update LGA (Admin only)
  // --------------------
  @Patch(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update an existing LGA (Admin only)' })
  @ApiResponse({ status: 200, description: 'LGA updated successfully' })
  @ApiResponse({ status: 404, description: 'LGA not found' })
  update(@Param('id') id: string, @Body() dto: UpdateLgaDto) {
    return this.lgaService.update(id, dto);
  }

  // --------------------
  // Delete LGA (Admin only)
  // --------------------
  @Delete(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete an LGA (Admin only)' })
  @ApiResponse({ status: 200, description: 'LGA deleted successfully' })
  @ApiResponse({ status: 404, description: 'LGA not found' })
  remove(@Param('id') id: string) {
    return this.lgaService.remove(id);
  }
  */
}
