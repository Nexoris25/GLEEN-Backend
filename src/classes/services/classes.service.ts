// src/classes/services/classes.service.ts
import {
Injectable,
NotFoundException,
BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ClassEntity } from '../entities/class.entity';
import { User } from 'src/user/models/user.model';
import { CreateClassDto } from '../dto/create-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { UserService } from '../../user/services/user.service'; 
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Op, fn, col } from 'sequelize';
import { randomUUID } from 'crypto';
import axios, { AxiosError } from 'axios';
import { LessonQueryDto } from 'src/lesson/dto/query.dto';
import { Sequelize } from 'sequelize';

import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClassEnrollment } from 'src/classes/models/class-enrollment.model';

interface DailyMeetingTokenProperties {
// Time & access controls
room_name?: string;                     // Strongly recommended – limits token to one room
exp?: number;                           // Unix timestamp (seconds) – token expiration
nbf?: number;                           // Not before (Unix timestamp)
eject_at_token_exp?: boolean;           // Default: false – kick user when token expires
eject_after_elapsed?: number;           // Seconds after join → eject

// Participant identity
user_name?: string;
user_id?: string;

// Ownership & privileges
is_owner?: boolean;                     // Default: false

// UI / behavior controls
start_video_off?: boolean;              // Default: false
start_audio_off?: boolean;              // Default: false
enable_screenshare?: boolean;           // Default: true
enable_prejoin_ui?: boolean;
close_tab_on_exit?: boolean;            // Default: false
redirect_on_meeting_exit?: string;      // URL to redirect after exit
lang?: string;                          // e.g. "en", "es", "fr"...

// Recording & transcription
enable_recording?: 'cloud' | 'cloud-audio-only' | 'local' | 'raw-tracks';
start_cloud_recording?: boolean;        // Default: false
// start_cloud_recording_opts?: Record<string, any>; // optional object – keep small
auto_start_transcription?: boolean;     // Default: false
enable_live_captions_ui?: boolean;
enable_recording_ui?: boolean;

// Other UI/features
enable_terse_logging?: boolean;         // Default: false – for large meetings
knocking?: boolean;                     // Default: false – request to join

// Permissions (advanced – can override room defaults)
hasPresence?: boolean;
canSend?: boolean | string[];           // true=all, false=none, or ['video','audio',...]
canReceive?: Record<string, boolean | string[]>;
canAdmin?: boolean | string[];          // 'participants', 'streaming', 'transcription'

// Catch-all for future/undocumented fields
[key: string]: unknown;
}

@Injectable()
export class ClassesService {
constructor(
@InjectModel(ClassEntity)
private readonly classModel: typeof ClassEntity,
private readonly usersService: UserService,
@InjectModel(User)
private readonly userModel: typeof User,
@InjectModel(ClassEnrollment)
    private readonly enrollmentModel: typeof ClassEnrollment,
) {}


private readonly MAX_LIMIT = 500;
private readonly DAILY_API_KEY = process.env.DAILY_API_KEY;
private readonly DAILY_API_URL = 'https://api.daily.co/v1/rooms';
private readonly DAILY_API_TOKEN_URL = 'https://api.daily.co/v1/meeting-tokens';



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
throw new BadRequestException('startTime must be at least 10 minutes in the future'); }

if (isNaN(dto.startTime.getTime()) || isNaN(dto.endTime.getTime())) {
throw new BadRequestException('Invalid startTime or endTime'); }



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


const tutor = await this.userModel.findByPk(dto.tutorId, {
  attributes: ['fullName'], });
const tutorFullName = tutor ? `${tutor.fullName}` : 'Tutor';




const startUnix = Math.floor(new Date(dto.startTime).getTime() / 1000);
const endUnix = Math.floor(new Date(dto.endTime).getTime() / 1000);
console.log('new datails ', tutorFullName)
// 4. Generate owner / teacher token (full control)
ownerToken = await this.generateMeetingToken({
room_name: roomName,
is_owner: true,
nbf: startUnix, // cannot join before start time
exp: endUnix,   // auto-kick after end time
eject_at_token_exp: true,
// Optional but useful
user_name: tutorFullName,          // shows in Daily UI
user_id: dto.tutorId,         // Daily-recognized field
});
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
console.log('Saving class with lengths:', {
title: dto.title?.length,
description: dto.description?.length,
roomName: roomName.length,
roomURL: dailyRoom.url?.length,
ownerToken: ownerToken?.length || 0,
});
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







async findAllWithDetails(
query?: LessonQueryDto, // includes optional id, title, subtitle, pagination
) {
const limit = Math.min(query?.limit ?? 10, this.MAX_LIMIT);
const offset = query?.offset ?? 0;

// Build where clause dynamically
const where: any = {};
if (query?.id) where.id = query.id;
if (query?.title) where.title = { [Op.iLike]: `%${query.title}%` };

const result = await this.classModel.findAndCountAll({
where,
order: [['createdAt', 'DESC']],
limit: query?.id ? undefined : limit,
offset: query?.id ? undefined : offset,
subQuery: false,
});

// 🔹 If ID was provided → return single lesson or 404
if (query?.id) {
if (!result.rows.length) {
throw new NotFoundException(`Lesson with id ${query.id} not found`);
}
return result.rows[0];
}

// 🔹 Default behaviour (list)
const total = Array.isArray(result.count)
? result.count.reduce((sum, item) => sum + Number(item.count), 0)
: result.count;

return {
data: result.rows,
meta: {
totalItems: total,
limit,
offset,
currentCount: result.rows.length,
hasNext: offset + limit < total,
hasPrevious: offset > 0,
},
};
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

const tutor = await this.userModel.findByPk(userId, { attributes: ['fullName'], });
const studentFullName = tutor ? `${tutor.fullName}` : 'Student';

// 4. Generate owner / teacher token (full control)
const studentToken = await this.generateMeetingToken({
room_name: cls.roomName,
is_owner: false,
// Optional but useful
user_name: studentFullName,          // shows in Daily UI
user_id: userId,         // Daily-recognized field
});


if (!enrolled.includes(userId)) {
cls.enrolledStudents = [...enrolled, userId]; await cls.save(); }
await cls.reload(); // optional but good for sanity

// After generating Daily token
await this.createEnrollment({
  userId,
  classId: cls.id,
  dailyRoomName: cls.roomName,
  dailyToken: studentToken,
});


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


async listAllDailyRooms(): Promise<any[]> {
const rooms: any[] = [];
let cursor: string | undefined;

try {
do {
const response = await axios.get('https://api.daily.co/v1/rooms', {
headers: {
Authorization: `Bearer ${this.DAILY_API_KEY}`,
},
params: {
limit: 100,          // maximum allowed value
cursor,              // undefined on first call → skipped by axios
},
});

// The actual room objects are in response.data.data (array)
rooms.push(...(response.data.data || []));

// Next page token (may be undefined/null when done)
cursor = response.data.next_cursor;
} while (cursor);

return rooms;
} catch (err: any) {
// Improve error handling a bit
const errorMsg = err.response?.data?.error 
|| err.response?.data?.msg 
|| err.message 
|| 'Unknown error';

throw new BadRequestException(`Failed to list Daily rooms: ${errorMsg}`);
}
}












/**
* Generates a Daily.co meeting token with flexible, optional properties.
* Useful for creating tokens for students, tutors, or custom roles.
*
* @param props All token properties (all optional)
* @returns The JWT token string
* @throws BadRequestException if the Daily API call fails
*/
async generateMeetingToken(props: DailyMeetingTokenProperties = {}): Promise<string> {
// Security / best-practice warnings (logged only – not thrown)
if (!props.room_name) {
console.warn(
'generateMeetingToken: No room_name provided → token valid for ALL rooms in domain!'
);
}
if (!props.exp) {
console.warn(
'generateMeetingToken: No exp provided → token has no expiration (security risk)!'
);
}

// Build the properties object (only include defined values)
const properties: Record<string, any> = {};

// Copy only defined properties (skip undefined)
Object.entries(props).forEach(([key, value]) => {
if (value !== undefined) {
properties[key] = value;
}
});

const payload = { properties };

try {
const response = await axios.post<{ token: string }>(
this.DAILY_API_TOKEN_URL,
payload,
{
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${this.DAILY_API_KEY}`,
},
}
);

return response.data.token;
} catch (err) {
const error = err as AxiosError<{ error?: string; msg?: string; info?: string; details?: any }>;
const msg =
error.response?.data?.error ||
error.response?.data?.msg ||
error.response?.data?.info ||
error.message ||
'Failed to generate Daily meeting token';

console.error('Daily token generation failed:', {
status: error.response?.status,
data: error.response?.data,
payloadSent: payload,
});

throw new BadRequestException(msg);
}
}




async createEnrollment(params: {
    userId: string;
    classId: string;
    dailyRoomName: string;
    dailyToken: string;
  }) {
    try {
      return await this.enrollmentModel.create({
        userId: params.userId,
        classId: params.classId,
        dailyRoomName: params.dailyRoomName,
        dailyToken: params.dailyToken,
      });
    } catch (error) {
      // Handle duplicate enrollment
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(
          'Student is already enrolled in this class',
        );
      }

      throw new InternalServerErrorException(
        'Failed to enroll student in class',
      );
    }
  }

  /**
   * Fetch existing enrollment (optional helper)
   */
  async findEnrollment(userId: string, classId: string) {
    return this.enrollmentModel.findOne({
      where: { userId, classId },
    });
  }



}
