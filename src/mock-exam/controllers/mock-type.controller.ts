import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  MockTypesResponseCountDto,
  MockTypesResponseDto,
  ResponseDto,
} from 'src/shared-types/response.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import stringify from 'safe-stable-stringify';
import { MockTypesService } from '../services/mock-type.service';
import { CreateMockTypeDto } from '../dtos/create-mock-type.dto';
import { SearchMockTypeDto } from '../dtos/search-mock-type.dto';
import { UpdateMockTypeDto } from '../dtos/udpdate-mock-type.dto';

@ApiTags('Mock Types')
@Controller('mock-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MockTypeController {
  constructor(private readonly mockTypesService: MockTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new mock type' })
  @ApiBody({ type: CreateMockTypeDto })
  @ApiResponse({
    status: 201,
    description: 'The mock type has been successfully created.',
    type: MockTypesResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error creating mock type',
    type: ResponseDto<null>,
  })
  async create(
    @Body() createDto: CreateMockTypeDto,
    @UserId() userId: string,
  ): Promise<MockTypesResponseDto> {
    try {
      const x = await this.mockTypesService.create(createDto, userId);
      return {
        status: 201,
        data: x,
        message: 'Mock type created successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error creating mock type',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all mock types' })
  @ApiResponse({
    status: 200,
    description: 'List of mock types',
    type: MockTypesResponseCountDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error fetching mock types',
    type: ResponseDto<null>,
  })
  async findAll(
    @Query() searchDto: SearchMockTypeDto,
  ): Promise<MockTypesResponseCountDto> {
    try {
      const x = await this.mockTypesService.findAll(searchDto);
      return {
        status: 200,
        data: x,
        message: 'Mock types fetched successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error fetching mock types',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a mock type by ID' })
  @ApiResponse({
    status: 200,
    description: 'The mock type',
    type: MockTypesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Mock type not found',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error fetching mock type',
    type: ResponseDto<null>,
  })
  async findById(@Param('id') id: string): Promise<MockTypesResponseDto> {
    try {
      const x = await this.mockTypesService.findById(id);
      if (!x) {
        return {
          status: 404,
          message: 'Mock type not found',
          data: null,
        };
      }
      return {
        status: 200,
        data: x,
        message: 'Mock type fetched successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error fetching mock type',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a mock type by ID' })
  @ApiBody({ type: UpdateMockTypeDto })
  @ApiResponse({
    status: 200,
    description: 'The mock type has been successfully updated.',
    type: MockTypesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Mock type not found',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error updating mock type',
    type: ResponseDto<null>,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMockTypeDto,
  ): Promise<MockTypesResponseDto> {
    try {
      const x = await this.mockTypesService.update(id, updateDto);
      if (!x) {
        return {
          status: 404,
          message: 'Mock type not found',
          data: null,
        };
      }
      return {
        status: 200,
        data: x,
        message: 'Mock type updated successfully',
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error updating mock type',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a mock type by ID' })
  @ApiResponse({
    status: 200,
    description: 'The mock type has been successfully deleted.',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    status: 404,
    description: 'Mock type not found',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    status: 500,
    description: 'Error deleting mock type',
    type: ResponseDto<null>,
  })
  async delete(@Param('id') id: string): Promise<ResponseDto<null>> {
    try {
      const deleted = await this.mockTypesService.delete(id);
      if (!deleted) {
        return {
          status: 404,
          message: 'Mock type not found',
          data: null,
        };
      }
      return {
        status: 200,
        message: 'Mock type deleted successfully',
        data: null,
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Error deleting mock type',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
