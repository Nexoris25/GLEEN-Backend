import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { RoomsService } from '../services/rooms.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { RolesGuard } from 'src/auth/GuardsDecorMiddleware/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // ================= CREATE ROOM =================
  @Post()
  @ApiOperation({ summary: 'Create new room Admin, SUPER_ADMIN' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new room' })
  async create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  // ================= GET ALL ROOMS =================
  @Get()
  @ApiOperation({ summary: 'Get all rooms (optional search/pagination)' })
  @ApiQuery({ name: 'search', required: false, description: 'Optional search by room name, URL, or provider' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(@Query('search') search?: string, @Query() pagination?: PaginationDto) {
    return this.roomsService.findAll(search, pagination);
  }

  // ================= GET ROOM BY NAME =================
  @Get(':name')
  @Roles('USER', 'TUTOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get a single room by name' })
  async findByName(@Param('name') name: string) {
    return this.roomsService.findByName(name);
  }

   // ================= list all rooms =================
  @Get('/all')
  @ApiOperation({ summary: 'Get all rooms' })
  async findAllDailyRooms() {
    const rooms = await this.roomsService.listAllDailyRooms();
console.log(`Total rooms: ${rooms.length}`);
return rooms;
  }

  // ================= DELETE ROOM BY NAME =================
  @Delete(':name')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a room by name' })
  async removeByName(@Param('name') name: string) {
    return this.roomsService.removeByName(name);
  }

  // ================= DELETE ALL DAILY.CO ROOMS =================
  @Delete('daily/purge')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete ALL Daily.co rooms (SUPER ADMIN ONLY)', description: 'Destructive operation. Must pass confirm=true' })
  @ApiQuery({ name: 'confirm', required: true, description: 'Must be set to "true" to confirm deletion' })
  async deleteAllDailyRooms(@Query('confirm') confirm: string) {
    if (confirm !== 'true') {
      throw new BadRequestException('Confirmation required. Pass ?confirm=true');
    }
    return this.roomsService.deleteAllDailyRooms();
  }
}


