import { BadRequestException, Injectable, NotFoundException, ConflictException, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { fn, col, literal, Op } from 'sequelize';

import { CreateLessonDto } from '../dto/create-lesson.dto';
import { UpdateLessonDto } from '../dto/update-lesson.dto';
import { LessonSearchDto } from '../dto/lesson-search.dto';
import { LessonComment } from '../models/lesson_comment.model';
import { LessonTracking } from '../models/lesson_tracking.model';
import { CreateLessonCommentDto } from '../dto/create-lesson-comment.dto';
//import { CreateLessonTrackingDto } from '../dto/create-lesson-tracking.dto';
import { UpdateLessonTrackingDto } from '../dto/update-lesson-tracking.dto';
import { UpdateLessonCommentDto } from '../dto/update-lesson-comment.dto';
import { LessonQueryDto } from '../dto/query.dto';
import stringify from "safe-stable-stringify";
import { Lesson } from '../models/lesson.model';
import { Subject } from 'src/subject/models/subject.model';
import { User } from 'src/user/models/user.model';
import { LessonTopic } from '../models/lesson_topic.model';
import { BunnyService } from 'src/common/services/bunny-all.service';


@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson)
    private lessonModel: typeof Lesson,
    private readonly bunnyService: BunnyService,
    @InjectModel(LessonComment)
    private lessonCommentModel: typeof LessonComment,
    @InjectModel(LessonTracking)
    private lessonTrackingModel: typeof LessonTracking,
  ) {}

  private readonly MAX_LIMIT = 500;

  
async create(createLessonDto: CreateLessonDto, userId: string, avatarOrCover?: Express.Multer.File,): Promise<Lesson> {
try {
const { subjectId, title } = createLessonDto;
const subjectExists = await Subject.findOne({ where: { id: subjectId } });
const userExists = await User.findOne({ where: { id: userId } });

if (!subjectExists) {
throw new NotFoundException('Subject with ID not found'); }
if (!userExists) { throw new NotFoundException('User with ID not found'); }

//CHECK IF TITLE EXISTS (PER SUBJECT)
const existingLesson = await this.lessonModel.findOne({
where: {
subjectId,
title,
},
});

if (existingLesson) {
throw new ConflictException(
`A lesson with the title "${title}" already exists for this subject`,
);
}



let imageUrl: string | null = null;
if (avatarOrCover) {
  console.log('Uploading avatar or cover image...', avatarOrCover.originalname);
imageUrl = await this.bunnyService.upload({
        buffer: avatarOrCover.buffer,
        mimeType: avatarOrCover.mimetype,
        originalName: avatarOrCover.originalname,
        directory: 'lesson-topics',
      });

}
const lesson = await this.lessonModel.create({ ...createLessonDto, userId, avatarOrCover: imageUrl, }, { isNewRecord: true, userId });

return lesson
} catch (error) {
   //LET HTTP EXCEPTIONS PASS THROUGH
    if (error instanceof HttpException) {
      throw error;
    }
throw new BadRequestException({
message: 'Error creating lesson',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}), }); }
}


  // Your findOne (by id) - already good, using findByPk
  async findOne(id: string): Promise<Lesson> {
    try {
      const lesson = await this.lessonModel.findByPk(id);
      if (!lesson) {
        throw new NotFoundException(`Lesson with id ${id} not found`);
      }
      return lesson;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error finding lesson',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  // Your remove (delete by id) - already good
  async remove(id: string): Promise<void> {
    try {
      const lesson = await this.findOne(id); // reuses findOne for consistency
      await lesson.destroy();
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting lesson',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  // ... rest of your methods (findAll, update, comments, tracking, etc.) remain unchanged
  // They already use correct Sequelize patterns (.findAndCountAll, .findOne, .upsert, .update, .save on instance, .destroy)

  

async createTracking(lessonId: string, userId: string) {
  const [tracking] = await this.lessonTrackingModel.upsert(
    {
      lessonId,
      userId,
    },
    {
      returning: true,
    },
  );

  return tracking;
}






async findTrackingById(id: string): Promise<LessonTracking> {
try {
const tracking = await this.lessonTrackingModel.findByPk(id);
if (!tracking) {
throw new NotFoundException(`Tracking with id ${id} not found`);
}
return tracking;
} catch (error) {
throw new BadRequestException({
message: 'Error finding lesson tracking',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}

async findTrackingByLessonAndUser(lessonId: string, userId: string): Promise<LessonTracking> {
try {
const tracking = await this.lessonTrackingModel.findOne({ where: { lessonId, userId } });
return tracking;
} catch (error) {
throw new BadRequestException({
message: 'Error finding lesson tracking by lesson and user',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}

async updateTracking(id: string, updateTrackingDto: UpdateLessonTrackingDto): Promise<LessonTracking> {
try {
const tracking = await this.findTrackingById(id);
Object.assign(tracking, updateTrackingDto);
return await tracking.save();
} catch (error) {
throw new BadRequestException({
message: 'Error updating lesson tracking',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}


 async completeLessonTracking(lessonId: string, userId: string) {
    // Find the tracking record
    const tracking = await this.lessonTrackingModel.findOne({
      where: { lessonId, userId },
    });

    if (!tracking) {
      throw new NotFoundException(
        `Lesson tracking not found for lesson ${lessonId} and user ${userId}`,
      );
    }

    // Update dateCompleted to current timestamp
    tracking.dateCompleted = new Date();
    await tracking.save();

    return tracking;
  }



async removeTracking(id: string): Promise<void> {
try {
const tracking = await this.findTrackingById(id);
await tracking.destroy();
} catch (error) {
throw new BadRequestException({
message: 'Error deleting lesson tracking',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}


async createComment(createCommentDto: CreateLessonCommentDto, userId: string): Promise<LessonComment> {
try {
const comment = await this.lessonCommentModel.create({ ...createCommentDto, userId }, { isNewRecord: true, userId });
return comment;
} catch (error) {
throw new BadRequestException({
message: 'Error creating lesson comment',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}

async findCommentById(id: string): Promise<LessonComment> {
try {
const comment = await this.lessonCommentModel.findByPk(id);
if (!comment) {
throw new NotFoundException(`Comment with id ${id} not found`);
}
return comment;
} catch (error) {
throw new BadRequestException({
message: 'Error finding lesson comment',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}

async findCommentByLesson(lessonId: string): Promise<{ rows: LessonComment[]; count: number }> {
try {
const comments = await this.lessonCommentModel.findAndCountAll({ where: { lessonId } });
return comments;
} catch (error) {
throw new BadRequestException({
message: 'Error finding lesson comments',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
};

async findCommentByLessonAndUser(lessonId: string, userId: string): Promise<LessonComment | null> {
try {
const comment = await this.lessonCommentModel.findOne({ where: { lessonId, userId } });
return comment;
} catch (error) {
throw new BadRequestException({
message: 'Error finding lesson comment by lesson and user',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
};

async updateComment(id: string, updateCommentDto: UpdateLessonCommentDto): Promise<LessonComment> {
try {
const comment = await this.findCommentById(id);
Object.assign(comment, updateCommentDto);
return await comment.save();
} catch (error) {
throw new BadRequestException({
message: 'Error updating lesson comment',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}

async removeComment(id: string): Promise<void> {
try {
const comment = await this.findCommentById(id);
await comment.destroy();
} catch (error) {
throw new BadRequestException({
message: 'Error deleting lesson comment',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}






//  start new
// start new
async findAllWithDetails(
  query?: LessonQueryDto, // includes optional id, title, subtitle, pagination
) {
  const limit = Math.min(query?.limit ?? 10, this.MAX_LIMIT);
  const offset = query?.offset ?? 0;

  // Build where clause dynamically
  const where: any = {};
  if (query?.id) where.id = query.id;
  if (query?.title) where.title = { [Op.iLike]: `%${query.title}%` };
  if (query?.subtitle) where.subtitle = { [Op.iLike]: `%${query.subtitle}%` };

  const result = await this.lessonModel.findAndCountAll({
    where,
    include: [
      {
        model: Subject,
        attributes: ['id', 'title', 'tutorId'],
      },
      {
        model: User,
        attributes: ['id', 'fullName', 'email', 'avatar'],
        required: false,
      },
      {
        model: LessonTopic,
        as: 'topics',
        attributes: [],
      },
    ],
    attributes: {
      include: [
        [fn('COUNT', col('topics.id')), 'totalTopics'],
        [fn('SUM', col('topics.duration')), 'totalDuration'],
        [
          literal(`(
            SELECT COUNT(DISTINCT lt."userId")
            FROM "lesson_trackings" lt
            WHERE lt."lessonId" = "Lesson"."id"
          )`),
          'totalUsers',
        ],
        [
          literal(`(
            SELECT COALESCE(json_agg(u ORDER BY u.last_seen DESC), '[]'::json)
            FROM (
              SELECT
                usr.id,
                usr.avatar,
                MAX(lt."createdAt") AS last_seen
              FROM "lesson_trackings" lt
              JOIN "users" usr ON usr.id = lt."userId"
              WHERE lt."lessonId" = "Lesson"."id"
              GROUP BY usr.id, usr.avatar
              ORDER BY last_seen DESC
              LIMIT 4
            ) u
          )`),
          'recentUsers',
        ],
      ],
    },
    group: ['Lesson.id', 'subject.id', 'user.id'],
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



// end new


async findAll(searchDto: LessonSearchDto): Promise<{ rows: Lesson[]; count: number; }> {
try {
const { offset, limit, ...rest } = searchDto;
const whereClause: any = {};
if (searchDto.title) {
whereClause.title = { [Op.iLike]: `%${searchDto.title}%` };
}
if (searchDto.subtitle) {
whereClause.subtitle = { [Op.iLike]: `%${searchDto.subtitle}%` };
}
if (searchDto.subjectId) {
whereClause.subjectId = searchDto.subjectId;
}
if (searchDto.userId) {
whereClause.userId = searchDto.userId;
}
if (searchDto.description) {
whereClause.description = { [Op.iLike]: `%${searchDto.description}%` };
}
if (searchDto.mainContent) {
whereClause.mainContent = { [Op.iLike]: `%${searchDto.mainContent}%` };
}
if (searchDto.fileType) {
whereClause.fileType = searchDto.fileType;
}
const lesson = await this.lessonModel.findAndCountAll({ where: whereClause, offset, limit });
return lesson;
} catch (error) {
throw new BadRequestException({
message: 'Error searching lessons',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}




async update(
  id: string,
  updateLessonDto: UpdateLessonDto,
  avatarOrCover?: Express.Multer.File,
): Promise<Lesson> {
  try {
    const lesson = await this.findOne(id);
let imageUrl: string | null = null;
    // ✅ Upload file to Bunny if provided
    if (avatarOrCover) {
      imageUrl = await this.bunnyService.upload({
        buffer: avatarOrCover.buffer,
        mimeType: avatarOrCover.mimetype,
        originalName: avatarOrCover.originalname,
        directory: 'lesson-topics',
      });

      // ✅ Store Bunny URL in DB
      updateLessonDto.avatarOrCover = imageUrl;
    }

    Object.assign(lesson, updateLessonDto);

    return await lesson.save();
  } catch (error) {
    throw new BadRequestException({
      message: 'Error updating lesson',
      details: stringify({
        message: error.message,
        stack: error.stack,
        details: error.response || error,
      }),
    });
  }
}








}








