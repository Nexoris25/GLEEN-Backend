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
import { RoomsService } from '../../rooms/services/rooms.service';
import { UserService } from '../../user/services/user.service'; 
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Op, fn, col } from 'sequelize';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(ClassEntity)
    private readonly classModel: typeof ClassEntity,
    private readonly roomsService: RoomsService,
    private readonly usersService: UserService,
  ) {}

  // CREATE CLASS
  async create(dto: CreateClassDto) {
    try {
      // Check unique title
      const existing = await this.classModel.findOne({ where: { title: dto.title } });
      if (existing) {
        console.warn(`Class title "${dto.title}" already exists`);
        return { success: false, message: `Class title "${dto.title}" already exists` };
      }

      // Validate room
      let room;
      try {
        room = await this.roomsService.findById(dto.roomId);
        if (!room) {
          console.warn(`Room with ID "${dto.roomId}" does not exist`);
          return { success: false, message: `Room with ID "${dto.roomId}" does not exist` };
        }
      } catch (err) {
        console.error('Error fetching room:', err.message);
        return { success: false, message: 'Error validating room' };
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

      const createdClass = await this.classModel.create({
        ...dto,
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

      // Validate room
      if (dto.roomId) {
        try {
          const room = await this.roomsService.findById(dto.roomId);
          if (!room) {
            console.warn(`Room with ID "${dto.roomId}" does not exist`);
            return { success: false, message: `Room with ID "${dto.roomId}" does not exist` };
          }
        } catch (err) {
          console.error('Error validating room:', err.message);
          return { success: false, message: 'Error validating room' };
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

      let room = null;
      try {
        room = await this.roomsService.findByDailyRoomName(cls.roomId);
      } catch (err) {
        console.warn(`Room not found for class ${id}`);
      }

      return { success: true, data: { ...cls.toJSON(), roomUrl: room?.roomUrl, provider: room?.provider } };
    } catch (err) {
      console.error('FindOne class error:', err.message);
      return { success: false, message: 'Failed to fetch class' };
    }
  }

 // FIND ALL CLASSES WITH PAGINATION
async findAll(
  search?: string,
  roomId?: string,
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

    if (roomId?.trim()) where.roomId = roomId.trim();
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
        let room = null;
        try {
          room = await this.roomsService.findByDailyRoomName(cls.roomId);
        } catch {
          console.warn(`Room not found for class ${cls.id}`);
        }

        return { ...cls.toJSON(), roomUrl: room?.roomUrl, provider: room?.provider };
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
}
