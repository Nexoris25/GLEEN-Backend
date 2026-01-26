import { Injectable, NotFoundException, BadRequestException, ConflictException,
  InternalServerErrorException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, UniqueConstraintError,  literal, } from 'sequelize';
import { Subject } from '../models/subject.model';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import { User } from 'src/user/models/user.model';
import { BunnyService } from 'src/common/services/bunny-all.service';
import stringify from "safe-stable-stringify";
import { UserSubject } from '../models/user-subject.model';
import { validate as isUUID } from 'uuid';

@Injectable()
export class SubjectService {
constructor(
@InjectModel(Subject)
private readonly subjectModel: typeof Subject,
private readonly bunnyService: BunnyService, 
@InjectModel(User)
private readonly userModel: typeof User,
@InjectModel(UserSubject)
private readonly userSubjectModel: typeof UserSubject,
) {}


  async create(
  dto: CreateSubjectDto,
  authUserId: string,
  avatar?: Express.Multer.File,
): Promise<Subject> {

  // Validate tutor
  if (dto.tutorId) {
    const tutor = await this.userModel.findOne({
      where: { id: dto.tutorId, role: 'TUTOR' },
    });

    if (!tutor) {
      throw new BadRequestException(
        `Tutor with id ${dto.tutorId} does not exist or is not a tutor`,
      );
    }
  }

  const subjectData: Partial<Subject> = {
    ...dto,
    userId: authUserId,
  };

  // Upload avatar
  if (avatar) {
    try {
      const avatarUrl = await this.bunnyService.upload({
        buffer: avatar.buffer,
        mimeType: avatar.mimetype,
        originalName: avatar.originalname,
        directory: 'subjects',
      });
      
      subjectData.avatar = avatarUrl;
    } catch (err) {
      throw new BadRequestException('Failed to upload subject avatar');
    }
  }

  try {
    return await this.subjectModel.create(subjectData);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      const field = error.errors[0]?.path || 'Unknown field';
      throw new ConflictException(
        `A subject with this ${field} already exists`,
      );
    }
    throw error;
  }
}




  async findById(id: string) {
    const subject = await this.subjectModel.findByPk(id);
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async update(id: string, dto: UpdateSubjectDto, avatar?: Express.Multer.File,) {
    const subject = await this.findById(id);

    if (dto.tutorId) {
      const tutor = await this.userModel.findByPk(dto.tutorId);
      if (!tutor) throw new BadRequestException(`Tutor with ID '${dto.tutorId}' not found`);


  
    const tutor1 = await this.userModel.findOne({
      where: { id: dto.tutorId, role: 'TUTOR' },
    });
    if (!tutor1) {
      throw new BadRequestException(
        `Tutor with id ${dto.tutorId} does not exist or is not a tutor`,
      );
    }
    }

    let avatarUrl: string | null = null;
const updatedData: any = { ...dto };
if (avatar) {
avatarUrl = await this.bunnyService.upload({
    buffer: avatar.buffer,
    mimeType: avatar.mimetype,
    originalName: avatar.originalname,
    directory: 'subjects',
  });

  updatedData.avatar = avatarUrl;
}

    try {
      return await subject.update(updatedData);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const field = error.errors[0]?.path || 'Unknown field';
        throw new ConflictException(`A subject with this ${field} already exists`);
      }
      throw error;
    }
  }


  async remove(id: string): Promise<void> {
  if (!isUUID(id)) {
    throw new BadRequestException('Invalid subject ID');
  }

  try {
    const subject = await this.subjectModel.findByPk(id);

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    await subject.destroy(); // soft delete (paranoid: true)
  } catch (error) {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }

    throw new InternalServerErrorException(
      'Failed to delete subject',
    );
  }
}



  async restore(id: string) {
    const subject = await this.subjectModel.findOne({ where: { id }, paranoid: false });
    if (!subject) throw new NotFoundException('Subject not found');
    await subject.restore();
    return subject;
  }


async search(options: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const { search, limit, offset } = options;

  const isUUID =
    search &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      search,
    );

  const where = search
    ? {
        [Op.or]: [
          ...(isUUID ? [{ id: search }] : []), // ✅ exact UUID match
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ],
      }
    : {};

  return this.subjectModel.findAll({
    where,
    limit,
    offset,
    include: [
      {
        model: User,
        as: 'tutor',
        attributes: ['id', 'fullName', 'avatar'],
      },
    ],
  });
}



  /*
  async search(query: string) {
    return this.subjectModel.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { userId: { [Op.iLike]: `%${query}%` } },
          { tutorId: { [Op.iLike]: `%${query}%` } },
        ],
      },
    });
  }
  */

























  

  async findAll(search?: string): Promise<Subject[]> {
    try {
      const where: any = {};
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { id: { [Op.iLike]: `%${search}%` } },
        ];
      }
      return await this.subjectModel.findAll({ where });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching subjects',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findOne(id: string): Promise<Subject> {
    try {
      const subject = await this.subjectModel.findByPk(id);
      if (!subject) {
        throw new NotFoundException(`Subject with ID ${id} not found`);
      }
      return subject;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching subject',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }


  /*
  async update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<Subject> {
    try {
      const subject = await this.findOne(id);
      return await subject.update(updateSubjectDto);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating subject',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
*/


  async linkOne(userId: string, subjectId: string) {
    try {
      return await this.userSubjectModel.create({ userId, subjectId });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error linking subject to user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async linkMany(userId: string, subjectIds: string[]) {
    try {
      const records = subjectIds.map((subjectId) => ({ userId, subjectId }));
      return await this.userSubjectModel.bulkCreate(records, { ignoreDuplicates: true });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error linking multiple subjects to user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async unlinkOne(userId: string, subjectId: string) {
    try {
      return await this.userSubjectModel.destroy({ where: { userId, subjectId } });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error unlinking subject from user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async unlinkMany(userId: string, subjectIds: string[]) {
    try {
      return await this.userSubjectModel.destroy({ where: { userId, subjectId: subjectIds } });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error unlinking multiple subjects from user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

 


async getUserSubjects(
  userId: string,
  options?: {
    search?: string;
    limit?: number;
    offset?: number;
  },
) {
  const { search, limit, offset } = options || {};

  const where = search
    ? {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ],
      }
    : {};

  // 1️⃣ Fetch subjects
  const subjects = await this.subjectModel.findAll({
    where,
    limit,
    offset,

    attributes: {
      include: [
        // ✅ total students count
        [
          literal(`(
            SELECT COUNT(*)
            FROM "users_subjects" us
            WHERE us."subjectId" = "Subject"."id"
          )`),
          'studentsCount',
        ],
      ],
    },

    include: [
      // 🔐 only subjects assigned to this user
      {
        model: User,
        as: 'users',
        attributes: [],
        through: { attributes: [] },
        where: { id: userId },
        required: true,
      },

      // 👨‍🏫 tutor
      {
        model: User,
        as: 'tutor',
        attributes: ['id', 'fullName', 'avatar'],
      },
    ],
  });

  // 2️⃣ Fetch first 4 students with avatar PER subject
  const subjectsWithStudents = await Promise.all(
    subjects.map(async (subject) => {
      const students = await this.userModel.findAll({
        attributes: ['id', 'fullName', 'avatar'],
        include: [
          {
            model: Subject,
            attributes: [],
            through: { attributes: [] },
            where: { id: subject.id },
          },
        ],
        where: {
          avatar: { [Op.ne]: null },
        },
        limit: 4,
      });

      return {
        ...subject.toJSON(),
        studentsPreview: students,
      };
    }),
  );

  return subjectsWithStudents;
}





}
