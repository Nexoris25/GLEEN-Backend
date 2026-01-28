// src/classes/services/classes.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ClassEntity } from '../entities/class.entity';
import { CreateClassDto } from '../dto/create-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { UserService } from '../../user/services/user.service'; 
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Op, fn, col } from 'sequelize';
import { randomUUID } from 'crypto';
import axios from 'axios';



@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(ClassEntity)
    private readonly classModel: typeof ClassEntity,
    private readonly usersService: UserService,
  ) {}


    private readonly MAX_LIMIT = 500;
  private readonly DAILY_API_KEY = process.env.DAILY_API_KEY;
  private readonly DAILY_API_URL = 'https://api.daily.co/v1/rooms';


  // CREATE CLASS
  async create(dto: CreateClassDto) {
    let ownerToken: string;
    let dailyRoom: any;
    // Generate fresh room name (or remove 'name' key for random)
const safeTitle = dto.title
.toLowerCase()
.replace(/[^a-z0-9 -]/g, '') // only allowed chars
.replace(/\s+/g, '-')
.slice(0, 40);
    let roomName = `liveclass-${safeTitle}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    try {
      // Check unique title
      const existing = await this.classModel.findOne({ where: { title: dto.title } });
      if (existing) {
        console.warn(`Class title "${dto.title}" already exists`);
        return { success: false, message: `Class title "${dto.title}" already exists` };
      }

      const nowMs = Date.now();
    if (dto.startTime.getTime() <= nowMs + 10 * 60 * 1000) { // at least 10 min buffer
      throw new BadRequestException('startTime must be at least 10 minutes in the future');
    }


    if (isNaN(dto.startTime.getTime()) || isNaN(dto.endTime.getTime())) {
      throw new BadRequestException('Invalid startTime or endTime');
    }






// Validate room
try {
const expireAt = new Date(dto.startTime.getTime() + (2 * 60 * 60 * 1000));
const expireAtMs = dto.startTime.getTime() + 2 * 60 * 60 * 1000; // start + 2h
const expUnix = Math.floor(expireAtMs / 1000);

const currentUnix = Math.floor(nowMs / 1000);
if (expUnix <= currentUnix) {
throw new BadRequestException(
`Calculated exp (${expUnix}) is in the past or now (${currentUnix}) – adjust startTime`
);
}


    // 1. Prepare Daily.co room creation payload (permanent – no exp)
  const payload = {
    name: roomName,
    privacy: 'private',
    properties: {
      enable_chat: true,
    exp: expUnix,
      enable_hand_raising: true,
      owner_only_broadcast: true,           // Teacher controls broadcast
      enable_screenshare: true,
      enable_emoji_reactions: true,
      enable_shared_chat_history: true,
      enable_people_ui: true,
      //enable_breakout_rooms: true,  // only use for production
      start_video_off: true,
      start_audio_off: true,
      meeting_join_hook: 'https://dev.nexoristech.com/daily-join-hook', // Optional: your join hook URL
      // Add more properties as needed (no exp → room never expires automatically)
    },
  };


    // 2. Create the room on Daily.co
let dailyResponse;
try {
dailyResponse = await axios.post(
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

// Log success for debug
console.log('Daily room created successfully:', {
name: dailyRoom.name,
url: dailyRoom.url,
config: dailyRoom.config,
});
} catch (error: any) {
const dailyData = error.response?.data || {};
console.error('Daily.co API error details:', {
status: error.response?.status,
error: dailyData.error,
info: dailyData.info,          // ← this is the gold! e.g. "exp was ... in the past"
details: dailyData.details,
payloadSent: payload,          // what you sent
});

throw new BadRequestException(
`Failed to create room on Daily.co: ${error.response?.data?.error || error.message}`,
);
}




// 4. Generate owner / teacher token (full control)

const res = await axios.get(
  'https://api.daily.co/v1/rooms',
  {
    headers: {
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
  },
);

console.log('current rooms', res.data);

const startUnix = Math.floor(new Date(dto.startTime).getTime() / 1000);
const endUnix = Math.floor(new Date(dto.endTime).getTime() / 1000);

const ownerPayload = {
  room_name: roomName,
  is_owner: true,
/*
  nbf: startUnix, // cannot join before start time
  exp: endUnix,   // auto-kick after end time
  eject_at_token_exp:true,
  // Optional but useful
  user_name: 'Tutor',          // shows in Daily UI
  user_id: dto.tutorId,         // Daily-recognized field
*/
  // ✅ CUSTOM DATA — forwarded to webhooks
 // context: { userId: dto.tutorId, role: 'TUTOR', roomName: roomName, },
};

try {
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
console.log('Tutor meeting token generated successfully', ownerToken);
}

catch (error: any) {
const dailyOwnerData = error.response?.data || {};
console.error('Daily.co API error details:', {
status: dailyOwnerData.response?.status,
error: dailyOwnerData.error,
info: dailyOwnerData.info,          // ← this is the gold! e.g. "exp was ... in the past"
details: dailyOwnerData.details,
payloadSent: ownerPayload,          // what you sent
});
}

} catch (error: any) {
throw new BadRequestException(
`Failed to create room on Daily.co: ${error.response?.data?.error || error.message}`,
);
}

      // Validate tutor
      let tutor = await this.usersService.findOneById(dto.tutorId);
      if (!tutor) {
        try {
          tutor = await this.usersService.findOneByUsername(dto.tutorId);
          if (!tutor) {
            console.warn(`Tutor with ID or username "${dto.tutorId}" not found`);
            return { success: false, message: `Tutor with ID or username "${dto.tutorId}" not found` };
          }
          dto.tutorId = tutor.id; // normalize to UUID
        } catch (err) {
          console.error('Error validating tutor:', err.message);
          return { success: false, message: 'Error validating tutor' };
        }
      }

      console.log('Creating class with DTO:', dto, 'Daily room:', dailyRoom);
      const createdClass = await this.classModel.create({
        ...dto,
        roomName: roomName,
        roomURL: dailyRoom.url,
        ownerToken: ownerToken,
        enrolledStudents: [],
        attendance: [],
      });

      console.log('Class created successfully:', createdClass.id);
      return { success: true, data: createdClass };
    } catch (err) {
      console.error('Create class error:', err.message);
      return { success: false, message: 'Failed to create class' };
    }
  }


  async findPrevious() {
  const now = new Date(); // JS Date object

  return this.classModel.findAll({
    where: {
      endTime: { [Op.lt]: now }, // ended before now
    },
    order: [['endTime', 'DESC']],
  });
}

async findUpcoming() {
  const now = new Date();

  return this.classModel.findAll({
    where: {
      startTime: { [Op.gt]: now }, // starts after now
    },
    order: [['startTime', 'ASC']],
  });
}

async findLive() {
  const now = new Date();

  return this.classModel.findAll({
    where: {
      startTime: { [Op.lte]: now }, // started before now
      endTime: { [Op.gte]: now },   // ends after now
    },
    order: [['startTime', 'ASC']],
  });
}






  // UPDATE CLASS
  async update(id: string, dto: UpdateClassDto) {
    try {
      console.log('Updating class with ID:', id, 'DTO:', dto);

      const cls = await this.classModel.findByPk(id?.trim());
      if (!cls) {
        console.warn(`Class with ID ${id} not found`);
        return { success: false, message: 'Class not found' };
      }

      // Check unique title
      if (dto.title && dto.title !== cls.title) {
        const existing = await this.classModel.findOne({ where: { title: dto.title } });
        if (existing) {
          console.warn(`Class title "${dto.title}" already exists`);
          return { success: false, message: `Class title "${dto.title}" already exists` };
        }
      }

      // Validate tutor
      if (dto.tutorId) {
        let tutor = await this.usersService.findOneById(dto.tutorId);
        if (!tutor) {
          try {
            tutor = await this.usersService.findOneByUsername(dto.tutorId);
            if (!tutor) {
              console.warn(`Tutor with ID or username "${dto.tutorId}" not found`);
              return { success: false, message: `Tutor with ID or username "${dto.tutorId}" not found` };
            }
            dto.tutorId = tutor.id; // normalize
          } catch (err) {
            console.error('Error validating tutor:', err.message);
            return { success: false, message: 'Error validating tutor' };
          }
        }
      }

     

      const updated = await cls.update(dto);
      console.log('Class updated successfully:', updated.id);
      return { success: true, data: updated };
    } catch (err) {
      console.error('Update class error:', err.message);
      return { success: false, message: 'Failed to update class' };
    }
  }

  // FIND ONE CLASS
  async findOne(id: string) {
    try {
      console.log('Finding class with ID:', id);
      const cls = await this.classModel.findByPk(id?.trim());
      if (!cls) {
        console.warn(`Class with ID ${id} not found`);
        return { success: false, message: 'Class not found' };
      }
  } catch (err) {
      console.error('FindOne class error:', err.message);
      return { success: false, message: 'Failed to fetch class' };
    }
  }

 // FIND ALL CLASSES WITH PAGINATION
async findAll(
  search?: string,
  tutorId?: string,
  pagination?: PaginationDto, // <-- add pagination DTO
) {
  try {
    const where: any = {};

    if (search?.trim()) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search.trim()}%` } },
        { description: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

     if (tutorId?.trim()) where.tutorId = tutorId.trim();
    const limit = pagination?.limit ?? 10; // default limit
    const offset = pagination?.offset ?? 0;

    console.log('Fetching classes with filters:', where, 'limit:', limit, 'offset:', offset);

    const { rows, count } = await this.classModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['startTime', 'ASC']], // order by startTime
    });

    const results = await Promise.all(
      rows.map(async (cls) => {
         return { ...cls.toJSON(), };
      }),
    );

    return {
      success: true,
      data: results,
      meta: {
        totalItems: count,
        limit,
        offset,
        currentCount: rows.length,
        hasNext: offset + limit < count,
        hasPrevious: offset > 0,
      },
    };
  } catch (err) {
    console.error('FindAll classes error:', err.message);
    return { success: false, message: 'Failed to fetch classes' };
  }
}



  // DELETE CLASS
  async remove(id: string) {
    try {
      const cls = await this.classModel.findByPk(id?.trim());
      if (!cls) {
        console.warn(`Class with ID ${id} not found`);
        return { success: false, message: 'Class not found' };
      }

      await cls.destroy();
      console.log('Class deleted:', id);
      return { success: true, message: 'Class deleted successfully' };
    } catch (err) {
      console.error('Remove class error:', err.message);
      return { success: false, message: 'Failed to delete class' };
    }
  }

// ENROLL STUDENT
async enroll(userId: string, classId: string) {
  try { const cls = await this.classModel.findByPk(classId.trim());
    if (!cls) { return { success: false, message: 'Class not found' };     }
    const enrolled = cls.enrolledStudents ?? [];
    if (!enrolled.includes(userId)) {
      cls.enrolledStudents = [...enrolled, userId]; await cls.save(); }
    await cls.reload(); // optional but good for sanity
    return {
      success: true,
      message: 'Student enrolled',
      enrolledStudents: cls.enrolledStudents,
    };
  } catch (err) {
    return { success: false, message: 'Failed to enroll student' };
  }}

  // MARK ATTENDANCE
  async markAttendance(classId: string, userId: string) {
    try { const cls = await this.classModel.findByPk(classId?.trim());
      if (!cls) { return { success: false, message: 'Class not found' };  }
      const attended = cls.attendance ?? [];
      if (!attended.includes(userId)) {
      cls.attendance = [...attended, userId]; await cls.save(); }
    await cls.reload(); // optional but good for sanity
    return {
      success: true,
      message: 'Attendance marked',
      attendedStudents: cls.attendance,
    };
  } catch (err) {
    return { success: false, message: 'Failed to mark attendance' };
  }}




  
  
  
  





  async deleteDailyRoom(roomName: string): Promise<void> {
  if (!roomName) {
    throw new BadRequestException('Room name is required');
  }

  try {
    await axios.delete(`${this.DAILY_API_URL}/${roomName}`, {
      headers: {
        Authorization: `Bearer ${this.DAILY_API_KEY}`,
      },
    });

    console.log(`Deleted Daily room: ${roomName}`);
  } catch (err: any) {
    // Room not found
    if (err.response?.status === 404) {
      throw new NotFoundException(`Daily room "${roomName}" not found`);
    }

    // Any other error
    throw new BadRequestException(
      `Failed to delete Daily room "${roomName}": ${
        err.response?.data?.error || err.message
      }`,
    );
  }
}
  

  

}
