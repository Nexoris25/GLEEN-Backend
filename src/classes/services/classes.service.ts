// src/classes/services/classes.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ClassEntity } from '../entities/class.entity';
import { User } from 'src/user/models/user.model';
import { CreateClassDto } from '../dto/create-class.dto';
import { UpdateClassDto } from '../dto/update-class.dto';
import { AttendanceQueryDto } from '../dto/attendance-query.dto';
import { CreateClassRecordingDto } from '../dto/create-class-recording.dto';
import { RequestPrivateLessonDto } from '../dto/request-private-lesson.dto';
import { ClassRecording } from '../models/class-recording.model';
import { UserService } from '../../user/services/user.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Op, col, fn, literal } from 'sequelize';
import axios from 'axios';
import { LessonQueryDto } from 'src/lesson/dto/query.dto';

import { ClassEnrollment } from 'src/classes/models/class-enrollment.model';
import { Subject } from 'src/subject/models/subject.model';
import { Room } from 'src/rooms/models/room.model';
import { UserSubject } from 'src/subject/models/user-subject.model';
import { RoleEnum } from 'src/shared-types/RoleEnum';

interface DailyMeetingTokenProperties {
  room_name?: string;
  exp?: number;
  nbf?: number;
  eject_at_token_exp?: boolean;
  eject_after_elapsed?: number;
  user_name?: string;
  user_id?: string;
  is_owner?: boolean;
  start_video_off?: boolean;
  start_audio_off?: boolean;
  enable_screenshare?: boolean;
  enable_prejoin_ui?: boolean;
  close_tab_on_exit?: boolean;
  redirect_on_meeting_exit?: string;
  lang?: string;
  enable_recording?: 'cloud' | 'cloud-audio-only' | 'local' | 'raw-tracks';
  start_cloud_recording?: boolean;
  auto_start_transcription?: boolean;
  enable_live_captions_ui?: boolean;
  enable_recording_ui?: boolean;
  enable_terse_logging?: boolean;
  knocking?: boolean;
  hasPresence?: boolean;
  canSend?: boolean | string[];
  canReceive?: Record<string, boolean | string[]>;
  canAdmin?: boolean | string[];
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
    @InjectModel(ClassRecording)
    private readonly recordingModel: typeof ClassRecording,
    @InjectModel(UserSubject)
    private readonly userSubjectModel: typeof UserSubject,
  ) {}

  private readonly MAX_LIMIT = 500;
  private readonly DAILY_API_KEY = process.env.DAILY_API_KEY;
  private readonly DAILY_API_URL = 'https://api.daily.co/v1/rooms';
  private readonly DAILY_API_TOKEN_URL =
    'https://api.daily.co/v1/meeting-tokens';
  private readonly ROOM_DELETE_GRACE_MS = 60 * 60 * 1000;

  async create(dto: CreateClassDto) {
    let ownerToken: string;
    const safeTitle = dto.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 40);
    const roomName = `liveclass-${safeTitle}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    let roomURL: string;
    let finalRoomId: string = null;

    try {
      {
        const nowMs = Date.now();
        if (dto.startTime.getTime() <= nowMs + 10 * 60 * 1000) {
          throw new BadRequestException(
            'startTime must be at least 10 minutes in the future',
          );
        }

        const expireAtMs = dto.endTime.getTime() + this.ROOM_DELETE_GRACE_MS;
        const expUnix = Math.floor(expireAtMs / 1000);

        const currentUnix = Math.floor(nowMs / 1000);
        if (expUnix <= currentUnix) {
          throw new BadRequestException(
            `Calculated exp (${expUnix}) is in the past or now (${currentUnix}) – adjust endTime`,
          );
        }

        const payload = {
          name: roomName,
          privacy: 'private',
          properties: {
            enable_chat: true,
            exp: expUnix,
            enable_hand_raising: true,
            owner_only_broadcast: true,
            enable_screenshare: true,
            enable_emoji_reactions: true,
            enable_shared_chat_history: true,
            enable_people_ui: true,
            start_video_off: true,
            start_audio_off: true,
            meeting_join_hook: 'https://dev.nexoristech.com/daily-join-hook',
          },
        };

        try {
          const dailyResponse = await axios.post<{
            url: string;
            name: string;
            config: any;
          }>(this.DAILY_API_URL, payload, {
            headers: {
              Authorization: `Bearer ${this.DAILY_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });
          const dailyRoomData = dailyResponse.data;
          roomURL = dailyRoomData.url;

          const newDbRoom = await Room.create({
            name: roomName,
            dailyRoomName: dailyRoomData.name,
            roomUrl: dailyRoomData.url,
            ownerToken: '',
            provider: 'daily',
          });
          finalRoomId = newDbRoom.id;
        } catch (error) {
          const axiosError = error;
          const dailyData = axiosError.response?.data || {};
          throw new BadRequestException(
            `Failed to create room on Daily.co: ${dailyData.info || dailyData.error || axiosError.message}`,
          );
        }
      }

      const existingClass = await this.classModel.findOne({
        where: { title: dto.title },
      });
      if (existingClass) {
        throw new ConflictException(
          `Class title "${dto.title}" already exists`,
        );
      }

      const tutorRecord = await this.userModel.findByPk(dto.tutorId, {
        attributes: ['fullName'],
      });
      const tutorFullName = tutorRecord ? `${tutorRecord.fullName}` : 'Tutor';

      const startUnix = Math.floor(new Date(dto.startTime).getTime() / 1000);
      const endUnix = Math.floor(new Date(dto.endTime).getTime() / 1000);

      if (!ownerToken) {
        ownerToken = await this.generateMeetingToken({
          room_name: roomName,
          is_owner: true,
          nbf: startUnix,
          exp: endUnix,
          eject_at_token_exp: true,
          user_name: tutorFullName,
          user_id: dto.tutorId,
        });
      }

      let tutor = await this.usersService.findOneById(dto.tutorId);
      if (!tutor) {
        tutor = await this.usersService.findOneByUsername(dto.tutorId);
        if (!tutor) {
          throw new NotFoundException(
            `Tutor with ID or username "${dto.tutorId}" not found`,
          );
        }
        dto.tutorId = tutor.id;
      }

      const createdClass = await this.classModel.create({
        ...dto,
        roomId: finalRoomId,
        roomName: roomName,
        roomURL: roomURL,
        ownerToken: ownerToken,
        enrolledStudents: [],
        attendance: [],
      });

      await this.createEnrollment({
        userId: dto.tutorId,
        classId: createdClass.id,
        dailyRoomName: roomName,
        dailyToken: ownerToken,
      });

      return { success: true, data: createdClass };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException(
        `Failed to create class: ${err.message}`,
      );
    }
  }

  private buildUtcScheduledDateTime(date: string, time: string) {
    const normalizedTime = time.length === 5 ? `${time}:00` : time;
    const dt = new Date(`${date}T${normalizedTime}Z`);
    if (Number.isNaN(dt.getTime())) {
      throw new BadRequestException('Invalid date/time');
    }
    return dt;
  }

  async requestPrivateLesson(
    requestingUserId: string,
    dto: RequestPrivateLessonDto,
  ) {
    const requester = await this.userModel.findByPk(requestingUserId, {
      attributes: ['id', 'role', 'fullName'],
    });
    if (!requester) {
      throw new NotFoundException('User not found');
    }
    if (requester.role !== RoleEnum.USER) {
      throw new ForbiddenException(
        'Only normal users can request a private lesson',
      );
    }
    if (dto.tutorId === requestingUserId) {
      throw new BadRequestException(
        'tutorId cannot be the same as the requesting user',
      );
    }

    const tutor = await this.userModel.findByPk(dto.tutorId, {
      attributes: ['id', 'role', 'fullName'],
    });
    if (!tutor) {
      throw new NotFoundException('Tutor not found');
    }
    if (tutor.role !== RoleEnum.TUTOR) {
      throw new BadRequestException(
        'Provided tutorId does not belong to a tutor',
      );
    }

    const startTime = this.buildUtcScheduledDateTime(dto.date, dto.time);
    const durationMinutes = dto.durationMinutes ?? 60;
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const title = `Private lesson ${requestingUserId.slice(0, 8)} ${Date.now()}`;
    const description = `Private lesson requested by ${requester.fullName || requester.id}`;

    const created = await this.create({
      title,
      description,
      tutorId: dto.tutorId,
      startTime,
      endTime,
      date: dto.date,
      time: dto.time,
    });

    await this.enroll(requestingUserId, created.data.id);

    return {
      success: true,
      data: created.data,
    };
  }

  private async cleanupClassRoomIfExpired(cls: ClassEntity) {
    if (!cls?.roomName) return;

    const endMs = new Date(cls.endTime).getTime();
    const deleteAfterMs = endMs + this.ROOM_DELETE_GRACE_MS;
    if (Date.now() < deleteAfterMs) return;

    try {
      await axios.delete(`${this.DAILY_API_URL}/${cls.roomName}`, {
        headers: { Authorization: `Bearer ${this.DAILY_API_KEY}` },
      });
    } catch (err: any) {
      if (err.response?.status !== 404) {
        return;
      }
    }

    await cls.update({
      roomName: null,
      roomURL: null,
      ownerToken: null,
      roomId: null,
    } as any);
  }

  private async cleanupExpiredRooms() {
    const cutoff = new Date(Date.now() - this.ROOM_DELETE_GRACE_MS);
    const expired = await this.classModel.findAll({
      where: {
        endTime: { [Op.lt]: cutoff },
        roomName: { [Op.not]: null },
      },
      limit: 20,
      order: [['endTime', 'ASC']],
    });

    await Promise.all(
      expired.map((cls) => this.cleanupClassRoomIfExpired(cls)),
    );
  }

  async findPrevious() {
    await this.cleanupExpiredRooms();
    const now = new Date();
    return this.classModel.findAll({
      where: { endTime: { [Op.lt]: now } },
      order: [['endTime', 'DESC']],
    });
  }

  async findUpcoming() {
    await this.cleanupExpiredRooms();
    const now = new Date();
    return this.classModel.findAll({
      where: { startTime: { [Op.gt]: now } },
      order: [['startTime', 'ASC']],
    });
  }

  async findLive() {
    await this.cleanupExpiredRooms();
    const now = new Date();
    return this.classModel.findAll({
      where: {
        startTime: { [Op.lte]: now },
        endTime: { [Op.gte]: now },
      },
      order: [['startTime', 'ASC']],
    });
  }

  async findLivePaginated(query?: PaginationDto) {
    await this.cleanupExpiredRooms();
    const now = new Date();
    const limit = Math.min(query?.limit ?? 10, this.MAX_LIMIT);
    const offset = query?.offset ?? 0;

    const result = await this.classModel.findAndCountAll({
      where: {
        startTime: { [Op.lte]: now },
        endTime: { [Op.gte]: now },
      },
      include: [
        {
          model: User,
          as: 'tutor',
          attributes: ['id', 'fullName', 'username', 'avatar'],
        },
        { model: Subject, as: 'subject', attributes: ['id', 'title'] },
        { model: Room, as: 'room', attributes: ['id', 'name'] },
        {
          model: ClassEnrollment,
          as: 'enrollments',
          attributes: [],
          required: false,
        },
      ],
      attributes: {
        include: [[fn('COUNT', col('enrollments.id')), 'totalEnrolled']],
      },
      group: ['ClassEntity.id', 'tutor.id', 'subject.id', 'room.id'],
      order: [['startTime', 'ASC']],
      limit,
      offset,
      subQuery: false,
    });

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

  async findRecommended(userId: string, query?: PaginationDto) {
    await this.cleanupExpiredRooms();
    const now = new Date();
    const limit = Math.min(query?.limit ?? 10, this.MAX_LIMIT);
    const offset = query?.offset ?? 0;

    const userSubjects = await this.userSubjectModel.findAll({
      where: { userId },
      attributes: ['subjectId'],
    });
    const subjectIds = userSubjects.map((s) => s.subjectId);

    const where: any = {
      endTime: { [Op.gte]: now },
    };
    if (subjectIds.length) {
      where.subjectId = { [Op.in]: subjectIds };
    }

    const result = await this.classModel.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'tutor',
          attributes: ['id', 'fullName', 'username', 'avatar'],
        },
        { model: Subject, as: 'subject', attributes: ['id', 'title'] },
        { model: Room, as: 'room', attributes: ['id', 'name'] },
        {
          model: ClassEnrollment,
          as: 'enrollments',
          attributes: [],
          required: false,
        },
      ],
      attributes: {
        include: [[fn('COUNT', col('enrollments.id')), 'totalEnrolled']],
      },
      group: ['ClassEntity.id', 'tutor.id', 'subject.id', 'room.id'],
      order: [
        [literal('"totalEnrolled"'), 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit,
      offset,
      subQuery: false,
    });

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

  async findAllWithDetails(query?: LessonQueryDto) {
    const limit = Math.min(query?.limit ?? 10, this.MAX_LIMIT);
    const offset = query?.offset ?? 0;
    const where: any = {};
    if (query?.id) where.id = query.id;
    if (query?.title) where.title = { [Op.iLike]: `%${query.title}%` };

    const result = await this.classModel.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'tutor',
          attributes: ['id', 'fullName', 'username', 'avatar'],
        },
        { model: Subject, as: 'subject', attributes: ['id', 'title'] },
        { model: Room, as: 'room', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: query?.id ? undefined : limit,
      offset: query?.id ? undefined : offset,
      subQuery: false,
    });

    if (query?.id) {
      if (!result.rows.length) {
        throw new NotFoundException(`Class with id ${query.id} not found`);
      }
      return result.rows[0];
    }

    const total = Array.isArray(result.count)
      ? result.count.reduce((sum, item) => sum + Number(item.count), 0)
      : result.count;

    return {
      data: result.rows,
      meta: {
        totalItems: total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrevious: offset > 0,
      },
    };
  }

  async update(id: string, dto: UpdateClassDto) {
    try {
      const cls = await this.classModel.findByPk(id?.trim());
      if (!cls) {
        throw new NotFoundException(`Class with ID ${id} not found`);
      }

      if (dto.roomName) {
        const existingRoom = await Room.findOne({
          where: { name: dto.roomName },
        });
        if (existingRoom) {
          (dto as any).roomId = existingRoom.id;
          (dto as any).roomName = existingRoom.dailyRoomName;
          (dto as any).roomURL = existingRoom.roomUrl;
          (dto as any).ownerToken = existingRoom.ownerToken;
        }
      }

      if (dto.title && dto.title !== cls.title) {
        const existing = await this.classModel.findOne({
          where: { title: dto.title },
        });
        if (existing) {
          throw new ConflictException(
            `Class title "${dto.title}" already exists`,
          );
        }
      }

      if (dto.tutorId) {
        let tutor = await this.usersService.findOneById(dto.tutorId);
        if (!tutor) {
          tutor = await this.usersService.findOneByUsername(dto.tutorId);
          if (!tutor) {
            throw new NotFoundException(
              `Tutor with ID or username "${dto.tutorId}" not found`,
            );
          }
          dto.tutorId = tutor.id;
        }
      }

      const updated = await cls.update(dto);
      return { success: true, data: updated };
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to update class: ${err.message}`,
      );
    }
  }

  async findOne(id: string) {
    const cls = await this.classModel.findByPk(id?.trim(), {
      include: [
        {
          model: User,
          as: 'tutor',
          attributes: ['id', 'fullName', 'username', 'avatar'],
        },
        { model: Subject, as: 'subject', attributes: ['id', 'title'] },
        { model: Room, as: 'room', attributes: ['id', 'name'] },
      ],
    });
    if (!cls) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return cls;
  }

  async findAll(search?: string, tutorId?: string, pagination?: PaginationDto) {
    try {
      const where: any = {};
      if (search?.trim()) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search.trim()}%` } },
          { description: { [Op.iLike]: `%${search.trim()}%` } },
        ];
      }
      if (tutorId?.trim()) where.tutorId = tutorId.trim();
      const limit = pagination?.limit ?? 10;
      const offset = pagination?.offset ?? 0;

      const { rows, count } = await this.classModel.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          {
            model: User,
            as: 'tutor',
            attributes: ['id', 'fullName', 'username', 'avatar'],
          },
          { model: Subject, as: 'subject', attributes: ['id', 'title'] },
          { model: Room, as: 'room', attributes: ['id', 'name'] },
        ],
        order: [['startTime', 'ASC']],
      });

      return {
        success: true,
        data: rows,
        meta: {
          totalItems: count,
          limit,
          offset,
          hasNext: offset + limit < count,
          hasPrevious: offset > 0,
        },
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to fetch classes: ${err.message}`,
      );
    }
  }

  async remove(id: string) {
    const cls = await this.classModel.findByPk(id?.trim());
    if (!cls) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    try {
      await axios.delete(`${this.DAILY_API_URL}/${cls.roomName}`, {
        headers: { Authorization: `Bearer ${this.DAILY_API_KEY}` },
      });
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.warn('Failed to delete Daily room during class removal');
      }
    }

    await cls.destroy();
    return { success: true, message: 'Class deleted successfully' };
  }

  async enroll(userId: string, classId: string) {
    const cls = await this.classModel.findByPk(classId.trim());
    if (!cls) {
      throw new NotFoundException('Class not found');
    }
    const enrolled = cls.enrolledStudents ?? [];

    const user = await this.userModel.findByPk(userId, {
      attributes: ['fullName'],
    });
    const userName = user ? `${user.fullName}` : 'Student';

    const startUnix = Math.floor(new Date(cls.startTime).getTime() / 1000);
    const endUnix = Math.floor(new Date(cls.endTime).getTime() / 1000);
    const token = await this.generateMeetingToken({
      room_name: cls.roomName,
      is_owner: false,
      nbf: startUnix,
      exp: endUnix,
      eject_at_token_exp: true,
      user_name: userName,
      user_id: userId,
    });

    if (!enrolled.includes(userId)) {
      cls.enrolledStudents = [...enrolled, userId];
      await cls.save();
    }

    await this.createEnrollment({
      userId,
      classId: cls.id,
      dailyRoomName: cls.roomName,
      dailyToken: token,
    });

    return {
      success: true,
      message: 'Student enrolled',
      enrolledStudents: cls.enrolledStudents,
    };
  }

  async getJoinInfo(userId: string, classId: string) {
    const cls = await this.classModel.findByPk(classId.trim());
    if (!cls) {
      throw new NotFoundException('Class not found');
    }

    await this.cleanupClassRoomIfExpired(cls);
    if (!cls.roomName || !cls.roomURL) {
      throw new BadRequestException('Class has ended');
    }

    if (cls.tutorId === userId) {
      if (!cls.ownerToken) {
        const tutorRecord = await this.userModel.findByPk(cls.tutorId, {
          attributes: ['fullName'],
        });
        const tutorFullName = tutorRecord ? `${tutorRecord.fullName}` : 'Tutor';
        const startUnix = Math.floor(new Date(cls.startTime).getTime() / 1000);
        const endUnix = Math.floor(new Date(cls.endTime).getTime() / 1000);

        cls.ownerToken = await this.generateMeetingToken({
          room_name: cls.roomName,
          is_owner: true,
          nbf: startUnix,
          exp: endUnix,
          eject_at_token_exp: true,
          user_name: tutorFullName,
          user_id: cls.tutorId,
        });
        await cls.save();
      }

      return {
        classId: cls.id,
        roomUrl: cls.roomURL,
        dailyRoomName: cls.roomName,
        token: cls.ownerToken,
        isOwner: true,
      };
    }

    let enrollment = await this.findEnrollment(userId, cls.id);
    if (!enrollment) {
      const enrolled = cls.enrolledStudents ?? [];

      const user = await this.userModel.findByPk(userId, {
        attributes: ['fullName'],
      });
      const userName = user ? `${user.fullName}` : 'Student';

      const startUnix = Math.floor(new Date(cls.startTime).getTime() / 1000);
      const endUnix = Math.floor(new Date(cls.endTime).getTime() / 1000);
      const token = await this.generateMeetingToken({
        room_name: cls.roomName,
        is_owner: false,
        nbf: startUnix,
        exp: endUnix,
        eject_at_token_exp: true,
        user_name: userName,
        user_id: userId,
      });

      if (!enrolled.includes(userId)) {
        cls.enrolledStudents = [...enrolled, userId];
        await cls.save();
      }

      enrollment = await this.createEnrollment({
        userId,
        classId: cls.id,
        dailyRoomName: cls.roomName,
        dailyToken: token,
      });
    }

    return {
      classId: cls.id,
      roomUrl: cls.roomURL,
      dailyRoomName: cls.roomName,
      token: enrollment.dailyToken,
      isOwner: false,
    };
  }

  async markAttendance(classId: string, userId: string) {
    const cls = await this.classModel.findByPk(classId?.trim());
    if (!cls) {
      throw new NotFoundException('Class not found');
    }
    const attended = cls.attendance ?? [];
    if (!attended.includes(userId)) {
      cls.attendance = [...attended, userId];
      await cls.save();
    }
    return {
      success: true,
      message: 'Attendance marked',
      attendedStudents: cls.attendance,
    };
  }

  async listAllDailyRooms(): Promise<any[]> {
    const rooms: any[] = [];
    let cursor: string | undefined;
    try {
      do {
        const response = await axios.get('https://api.daily.co/v1/rooms', {
          headers: { Authorization: `Bearer ${this.DAILY_API_KEY}` },
          params: { limit: 100, cursor },
        });
        rooms.push(...(response.data.data || []));
        cursor = response.data.next_cursor;
      } while (cursor);
      return rooms;
    } catch (err: any) {
      throw new BadRequestException(
        `Failed to list Daily rooms: ${err.message}`,
      );
    }
  }

  async generateMeetingToken(
    props: DailyMeetingTokenProperties = {},
  ): Promise<string> {
    const properties: Record<string, any> = {};
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
        },
      );
      return response.data.token;
    } catch (err: any) {
      throw new BadRequestException(
        `Failed to generate Daily token: ${err.message}`,
      );
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
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(
          'Student is already enrolled in this class',
        );
      }
      throw new InternalServerErrorException(
        `Failed to create enrollment: ${error.message}`,
      );
    }
  }

  async getAttendanceList(query: AttendanceQueryDto) {
    try {
      const { search, page = 1, limit = 10 } = query;
      const offset = (page - 1) * limit;
      const where: any = {};
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { '$tutor.fullName$': { [Op.iLike]: `%${search}%` } },
          { '$subject.title$': { [Op.iLike]: `%${search}%` } },
        ];
      }
      const { rows, count } = await this.classModel.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'tutor',
            attributes: ['id', 'fullName', 'username', 'avatar'],
          },
          { model: Subject, as: 'subject', attributes: ['id', 'title'] },
          { model: Room, as: 'room', attributes: ['id', 'name'] },
        ],
        attributes: [
          'id',
          'title',
          'startTime',
          'endTime',
          'date',
          'time',
          'attendance',
        ],
        limit,
        offset,
        order: [['startTime', 'DESC']],
        subQuery: false,
      });
      return {
        data: rows,
        meta: {
          totalItems: count,
          itemsPerPage: limit,
          currentPage: page,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to fetch attendance list: ${error.message}`,
      );
    }
  }

  async findEnrollment(userId: string, classId: string) {
    return this.enrollmentModel.findOne({
      where: { userId, classId },
    });
  }

  // UPLOAD CLASS RECORDING
  async uploadRecording(dto: CreateClassRecordingDto) {
    try {
      const recording = await this.recordingModel.create({
        ...dto,
      });
      return { success: true, data: recording };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to upload recording: ${error.message}`,
      );
    }
  }

  // GET ALL RECORDINGS (optional search/pagination)
  async getRecordings(subjectId?: string) {
    try {
      const where: any = {};
      if (subjectId) where.subjectId = subjectId;

      const recordings = await this.recordingModel.findAll({
        where,
        include: [
          { model: Subject, as: 'subject', attributes: ['id', 'title'] },
        ],
        order: [['createdAt', 'DESC']],
      });

      return { success: true, data: recordings };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Failed to fetch recordings: ${error.message}`,
      );
    }
  }
}
