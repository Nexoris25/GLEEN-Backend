import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Room } from '../models/room.model';
import { ClassEntity } from '../../classes/entities/class.entity';
import { CreateRoomDto } from '../dto/create-room.dto';
//import { UpdateRoomDto } from '../dto/update-room.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import axios from 'axios';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room)
    private readonly roomModel: typeof Room,

     @InjectModel(ClassEntity)
    private readonly classModel: typeof ClassEntity, // ✅ inject ClassEntity
  ) {}

  private readonly MAX_LIMIT = 500;
  private readonly DAILY_API_KEY = process.env.DAILY_API_KEY;
  private readonly DAILY_API_URL = 'https://api.daily.co/v1/rooms';

  // ✅ CREATE ROOM
  async create(dto: CreateRoomDto) {
  const validNameRegex = /^[A-Za-z0-9-_]+$/;
  if (!validNameRegex.test(dto.name)) {
    throw new BadRequestException(
      'Room name can only contain letters, numbers, hyphens (-), and underscores (_)',
    );
  }

  const existing = await this.roomModel.findOne({
    where: { name: dto.name },
  });

  if (existing) {
    throw new BadRequestException(
      `Room with name "${dto.name}" already exists`,
    );
  }

    // 1. Prepare Daily.co room creation payload (permanent – no exp)
  const payload = {
    name: dto.name,
    privacy: 'private',
    properties: {
      enable_chat: true,
      enable_hand_raising: true,
      owner_only_broadcast: true,           // Teacher controls broadcast
      enable_screenshare: true,
      enable_emoji_reactions: true,
      enable_shared_chat_history: true,
      enable_people_ui: true,
      enable_breakout_rooms: true,
      start_video_off: true,
      start_audio_off: true,
      meeting_join_hook: 'https://dev.nexoristech.com/daily-join-hook', // Optional: your join hook URL
      // Add more properties as needed (no exp → room never expires automatically)
    },
  };


    // 2. Create the room on Daily.co
  let dailyRoom;
  try {
    const dailyResponse = await axios.post(
      this.DAILY_API_URL,
      payload,
      {
        headers: {
          Authorization: `Bearer ${this.DAILY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );
    dailyRoom = dailyResponse.data;
  } catch (error: any) {
    throw new BadRequestException(
      `Failed to create room on Daily.co: ${error.response?.data?.error || error.message}`,
    );
  }


  // 4. Generate owner/teacher token (full control)
  let ownerToken: string;
  try {
    const ownerPayload = {
      properties: {
        room_name: dailyRoom.name,
        is_owner: true, 
      },
    };

    const ownerRes = await axios.post(
      'https://api.daily.co/v1/meeting-tokens',
      ownerPayload,
      {
        headers: {
          Authorization: `Bearer ${this.DAILY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );
    ownerToken = ownerRes.data.token;
  } catch (error: any) {
    // Cleanup on failure
    console.log('Error generating owner token:', error.response?.data || error.message);
    await this.deleteDailyRoom(dailyRoom.name);
    throw new BadRequestException('Failed to generate owner token');
  }



  
  
  // 3. Generate student token
  let studentToken: string;
  try {
const studentPayload = {
  properties: {
    room_name: dailyRoom.name,           // required for room-specific token
    is_owner: false,
  },
};

    const studentRes = await axios.post(
      'https://api.daily.co/v1/meeting-tokens',
      studentPayload,
      {
        headers: {
          Authorization: `Bearer ${this.DAILY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );
    studentToken = studentRes.data.token;
  } catch (error: any) {
    // Cleanup: delete the Daily room if token generation fails
    await this.deleteDailyRoom(dailyRoom.name);
    throw new BadRequestException('Failed to generate student token');
  }



    // 5. Persist everything to your database – including tokens
  const room = await this.roomModel.create({
    name: dto.name,
    dailyRoomName: dailyRoom.name,
    roomUrl: dailyRoom.url,
    provider: 'daily.co',
    ownerToken,        // ← persisted
    studentToken,      // ← persisted
    // Add any other fields from dto if needed (e.g. title, description, classId, etc.)
  });


/*
  // 1️⃣ Create room on Daily.co FIRST
  let dailyRoom;
  try {
    const dailyResponse = await axios.post(
      this.DAILY_API_URL,
      { name: dto.name },
      {
        headers: {
          Authorization: `Bearer ${this.DAILY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    dailyRoom = dailyResponse.data;
  } catch (error) {
    throw new BadRequestException(
      'Failed to create room on Daily.co',
    );
  }

  // 2️⃣ Persist ONLY after Daily succeeds
  const room = await this.roomModel.create({
    ...dto,
    roomUrl: dailyRoom.url,
    dailyRoomName: dailyRoom.id, // immutable Daily ID
    provider: 'daily.co',
  });
*/
  return {
    room,
    studentJoinUrl: `${dailyRoom.url}?t=${studentToken}`,
    teacherJoinUrl: `${dailyRoom.url}?t=${ownerToken}`,
    // Optionally return tokens only in dev mode or for the teacher
    // studentToken,    // ← remove in production
    // ownerToken,      // ← remove in production
  };
}



async deleteAllDailyRooms() {
  let cursor: string | undefined;
  let deleted = 0;

  do {
    const listResponse = await axios.get(this.DAILY_API_URL, {
      headers: {
        Authorization: `Bearer ${this.DAILY_API_KEY}`,
      },
      params: {
        limit: 100,
        cursor,
      },
    });

    const rooms = listResponse.data.data;
    cursor = listResponse.data.next_cursor;
    for (const room of rooms) {
      try { console.log(`${this.DAILY_API_URL}/${room.name}`)
        await axios.delete(`${this.DAILY_API_URL}/${room.name}`, {
          headers: {
            Authorization: `Bearer ${this.DAILY_API_KEY}`,
          },
        });
        deleted++;
        console.log(`Deleted room ${room.name} (${room.name})`);
      } catch (err) {
        // Ignore 404 (already deleted)
       // console.log('err', err)
       if (err.response?.status === 404) {
        console.warn(`Room ${room.name} (${room.name}) not found on Daily.co — skipping`);
      } else {
        console.error(`Failed to delete room ${room.name} (${room.name}):`, err.message);
      }

        if (err.response?.status !== 404) {
          throw new BadRequestException(
            `Failed to delete Daily room ${room.name}`,
          );
        }
      }
    }
  } while (cursor);


   // 2️⃣ Delete all Daily.co rooms from DB
  const dbDeleted = await this.roomModel.destroy({
    where: { provider: 'daily.co' },
  });
  console.log(`Database purge complete. Removed ${dbDeleted} room entries.`);


  // 3️⃣ Delete all classes with startTime in the future, regardless of room
  const now = new Date();
  const futureClassesDeleted = await this.classModel.destroy({
    where: { startTime: { [Op.gt]: now } },
  });
  console.log(`Deleted ${futureClassesDeleted} future classes.`);

  
  return {
    message: 'All Daily rooms deleted',
    deleted,
  };
}


  // ✅ FIND ALL
  async findAll(search?: string, pagination?: PaginationDto) {
    const where = search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { roomUrl: { [Op.iLike]: `%${search}%` } },
            { provider: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const limit = pagination?.limit;
    const offset = pagination?.offset;
    const usePagination = limit !== undefined || offset !== undefined;
    const safeLimit = usePagination ? Math.min(limit ?? 10, this.MAX_LIMIT) : this.MAX_LIMIT;
    const safeOffset = usePagination ? offset ?? 0 : 0;

    const { rows, count } = await this.roomModel.findAndCountAll({
      where,
      limit: safeLimit,
      offset: safeOffset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      meta: {
        totalItems: count,
        limit: safeLimit,
        offset: safeOffset,
        currentCount: rows.length,
        hasNext: safeOffset + safeLimit < count,
        hasPrevious: safeOffset > 0,
        capped: !usePagination,
      },
    };
  }

  // ✅ FIND ONE BY NAME
  async findByName(name: string) {
    const room = await this.roomModel.findOne({ where: { name } });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }
 // ✅ FIND ONE BY ID
  async findById(id: string): Promise<Room> {
  const room = await this.roomModel.findByPk(id);
  if (!room) {
    throw new NotFoundException('Room not found');
  }
  return room;
}

  // ✅ UPDATE ROOM BY NAME
async findByDailyRoomName(dailyRoomName: string) {
  const room = await this.roomModel.findOne({
    where: { dailyRoomName },
  });

  if (!room) {
    throw new NotFoundException('Room not found');
  }

  return room;
}

  // ✅ DELETE
// ✅ DELETE by room name (DB + Daily.co)
async removeByName(name: string) {
  const room = await this.findByName(name);

  // 1️⃣ Delete room on Daily.co (if provider is Daily)
  //if (room.provider === 'daily.co') {
    try {
      await axios.delete(`${this.DAILY_API_URL}/${room.dailyRoomName}`, {
        headers: {
          Authorization: `Bearer ${this.DAILY_API_KEY}`,
        },
      });
    } catch (err) {
      // Daily returns 404 if room already deleted — allow DB cleanup
      if (err.response?.status !== 404) {
        throw new BadRequestException(
          'Failed to delete room on Daily.co',
        );
      }
    }
 // }

  // 2️⃣ Delete all classes associated with this room
    const deletedClasses = await this.classModel.destroy({
      where: { roomId: room.id }, // assuming ClassEntity has roomId FK
    });
    console.log(`Deleted ${deletedClasses} classes associated with room "${name}"`);
    
  // 2️⃣ Delete room from DB
  await room.destroy();

  return {
    message: `Room "${name}" deleted successfully`,
  };
}




// Optional helper method for cleanup
private async deleteDailyRoom(roomName: string) {
  try {
    await axios.delete(`${this.DAILY_API_URL}/${roomName}`, {
      headers: {
        Authorization: `Bearer ${this.DAILY_API_KEY}`,
      },
    });
  } catch (err) {
    console.error('Failed to delete Daily room during cleanup:', err);
    // Don't throw – just log
  }
}


}
