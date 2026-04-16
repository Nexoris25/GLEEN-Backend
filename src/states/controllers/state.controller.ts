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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import {
  CityArrayResponseDto,
  CityResponseDto,
  ResponseDto,
  StateArrayResponseDto,
  StateResponseDto,
} from 'src/shared-types/response.dto';
import stringify from 'safe-stable-stringify';
import { StatesService } from '../services/state.service';
import { CreateStateDto } from '../dto/create-state.dto';
import { UpdateStateDto } from '../dto/update-state.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('States')
@Controller('states')
export class StateController {
  constructor(private readonly stateService: StatesService) {}

  /*
@Post()
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiOperation({ summary: 'Create a new state' })
@ApiBody({ type: CreateStateDto })
@ApiResponse({ status: 201, description: 'State created successfully', type: StateResponseDto })
@ApiResponse({ status: 500, description: 'Error creating state', type: ResponseDto })
async create(@Body() createStateDto: CreateStateDto, @UserId() userId: string): Promise<StateResponseDto> {
try {
const state = await this.stateService.create(createStateDto, userId);
return {
status: HttpStatus.CREATED,
message: 'State created successfully',
data: state,
};
} catch (error) {
return {
status: HttpStatus.INTERNAL_SERVER_ERROR,
message: 'Error creating state',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}
*/

  @Get()
  @ApiOperation({ summary: 'Get all states with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number, starting from 1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'States retrieved successfully',
    type: StateArrayResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving states',
    type: ResponseDto,
  })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.stateService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a state by ID' })
  @ApiResponse({ status: 200, description: 'State retrieved successfully' })
  async findOne(@Param('id') id: string): Promise<StateResponseDto> {
    try {
      const state = await this.stateService.findOne(id);
      return {
        status: HttpStatus.OK,
        message: 'State retrieved successfully',
        data: state,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving state',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  /*
@Patch(':id')
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiOperation({ summary: 'Update a state by ID' })
@ApiResponse({ status: 200, description: 'State retrieved successfully', type: StateResponseDto })
@ApiResponse({ status: 500, description: 'Error retrieving state', type: ResponseDto })
async update(
@Param('id') id: string,
@Body() updateStateDto: UpdateStateDto,
): Promise<StateResponseDto> {
try {
const updated = await this.stateService.update(id, updateStateDto);
return {
status: HttpStatus.OK,
message: 'State updated successfully',
data: updated,
};
} catch (error) {
return {
status: HttpStatus.INTERNAL_SERVER_ERROR,
message: 'Error updating state',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}


@Delete(':id')
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiOperation({ summary: 'Delete a state by ID' })
@ApiResponse({ status: 200, description: 'State deleted successfully', type: StateResponseDto })
@ApiResponse({ status: 500, description: 'Error deleting state', type: ResponseDto })
async remove(@Param('id') id: string): Promise<StateResponseDto> {
try {
await this.stateService.remove(id);
return {
status: HttpStatus.OK,
message: 'State deleted successfully',
};
} catch (error) {
return {
status: HttpStatus.INTERNAL_SERVER_ERROR,
message: 'Error deleting state',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}


@Post('state/add-one-city')
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiOperation({ summary: 'Add a city to a state' })
@ApiBody({ schema: { example: { stateId: '<stateId>', title: 'New City' } } })
@ApiResponse({ status: 200, description: 'City added to state successfully', type: CityResponseDto })
@ApiResponse({ status: 500, description: 'Internal server error', type: ResponseDto })
async addOneCity(@Body() body: { stateId: string; title: string }): Promise<CityResponseDto> {
try {
const result = await this.stateService.createOneCity(body.title, body.stateId);
return {
status: HttpStatus.OK,
message: 'City added to state successfully',
data: result,
};
} catch (error) {
return {
status: HttpStatus.INTERNAL_SERVER_ERROR,
message: 'Internal server error',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}

@Post('state/add-many-cities')
@ApiOperation({ summary: 'Add multiple cities to a state' })
@ApiBody({ schema: { example: { stateId: '<stateId>', titles: ['City 1', 'City 2'] } } })
@ApiResponse({ status: 200, description: 'Cities added to state successfully', type: CityArrayResponseDto })
@ApiResponse({ status: 500, description: 'Internal server error', type: ResponseDto })
async addManyCities(@Body() body: { stateId: string; titles: string[] }): Promise<CityArrayResponseDto> {
try {
const result = await this.stateService.createManyCities(body.stateId, body.titles);
return {
status: HttpStatus.OK,
message: 'Cities added to state successfully',
data: result,
};
} catch (error) {
return {
status: HttpStatus.INTERNAL_SERVER_ERROR,
message: 'Internal server error',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}

@Get('state/:stateId/cities')
@ApiOperation({ summary: 'Get all cities for a state' })
@ApiResponse({ status: 200, description: 'Cities retrieved successfully', type: CityArrayResponseDto })
@ApiResponse({ status: 500, description: 'Error fetching cities', type: ResponseDto })
async getCitiesByState(@Param('stateId') stateId: string): Promise<CityArrayResponseDto> {
try {
const cities = await this.stateService.getCitiesByState(stateId);
return {
status: HttpStatus.OK,
message: 'Cities retrieved successfully',
data: cities,
};
} catch (error) {
return {
status: HttpStatus.INTERNAL_SERVER_ERROR,
message: 'Error fetching cities',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}

@Delete('delete-city/:cityId')
@ApiOperation({ summary: 'delete a city from db' })
@ApiResponse({ status: 200, description: 'City deleted successfully', type: CityResponseDto })
@ApiResponse({ status: 500, description: 'Internal server error', type: ResponseDto })
async deleteOneCity(@Param('cityId') cityId: string): Promise<CityResponseDto> {
try {
const result = await this.stateService.deleteOneCity(cityId);
return {
status: HttpStatus.OK,
message: 'City deleted successfully',
data: result,
};
} catch (error) {
return {
status: HttpStatus.INTERNAL_SERVER_ERROR,
message: 'Internal server error',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}
*/
}
