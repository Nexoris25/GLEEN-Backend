import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LessonTopic } from '../models/lesson_topic.model';
import { CreateLessonTopicDto } from '../dto/create-lesson-topic.dto';
import { UpdateLessonTopicDto } from '../dto/update-lesson-topic.dto';
import { SearchLessonTopicDto } from '../dto/search-lesson-topic.dto';
import stringify from 'safe-stable-stringify';
import { Op } from 'sequelize';
import { BunnyService } from 'src/common/services/bunny-all.service';

import { BulkCreateLessonTopicDto } from '../dto/bulk-create-lesson-topic.dto';
import { BulkUpdateLessonTopicDto } from '../dto/bulk-update-lesson-topic.dto';

@Injectable()
export class LessonTopicService {
  constructor(
    @InjectModel(LessonTopic)
    private readonly lessonTopicModel: typeof LessonTopic,
    private readonly bunnyService: BunnyService,
  ) {}

  async bulkCreate(
    lessonId: string,
    bulkDto: BulkCreateLessonTopicDto,
    userId: string,
  ): Promise<LessonTopic[]> {
    try {
      const payload = bulkDto.topics.map((topic) => ({
        ...topic,
        lessonId,
        userId,
      }));

      return await this.lessonTopicModel.bulkCreate(payload, {
        userId,
        individualHooks: true,
      } as any);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error bulk creating lesson topics',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async bulkUpdate(
    lessonId: string,
    bulkDto: BulkUpdateLessonTopicDto,
    userId: string,
  ): Promise<LessonTopic[]> {
    try {
      const updatedTopics: LessonTopic[] = [];

      for (const item of bulkDto.topics) {
        const topic = await this.lessonTopicModel.findByPk(item.id);
        if (!topic) {
          throw new NotFoundException(`Lesson topic with ID ${item.id} not found`);
        }

        if (topic.lessonId !== lessonId) {
          throw new BadRequestException(
            `Lesson topic ${item.id} does not belong to lesson ${lessonId}`,
          );
        }

        if (topic.userId !== userId) {
          throw new BadRequestException(
            'You are not allowed to update this lesson topic',
          );
        }

        const payload: Partial<LessonTopic> = { ...item } as any;
        delete (payload as any).id;
        delete (payload as any).status;
        delete (payload as any).lessonId;

        const updated = await topic.update(payload);
        updatedTopics.push(updated);
      }

      return updatedTopics;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error bulk updating lesson topics',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async create(
    createDto: CreateLessonTopicDto,
    userId: string,
    avatarOrCover?: Express.Multer.File,
    videoOrFileUrl?: Express.Multer.File,
    videoCaptionUrl?: Express.Multer.File,
  ): Promise<LessonTopic> {
    try {
      let avatarUrl: string | null = null;
      let videoUrl: string | null = null;
      let captionUrl: string | null = null;

      // Upload avatar / cover
      if (avatarOrCover) {
        avatarUrl = await this.bunnyService.upload({
          buffer: avatarOrCover.buffer,
          mimeType: avatarOrCover.mimetype,
          originalName: avatarOrCover.originalname,
          directory: 'lesson-topics',
        });
      }

      // Upload video or file
      if (videoOrFileUrl) {
        videoUrl = await this.bunnyService.upload({
          buffer: videoOrFileUrl.buffer,
          mimeType: videoOrFileUrl.mimetype,
          originalName: videoOrFileUrl.originalname,
          directory: 'lesson-topics',
        });
      }

      // Upload caption file
      if (videoCaptionUrl) {
        captionUrl = await this.bunnyService.upload({
          buffer: videoCaptionUrl.buffer,
          mimeType: videoCaptionUrl.mimetype,
          originalName: videoCaptionUrl.originalname,
          directory: 'lesson-topics/captions',
        });
      }

      // Persist to DB
      return await this.lessonTopicModel.create(
        {
          ...createDto,
          userId,
          avatarOrCover: avatarUrl,
          videoOrFileUrl: videoUrl,
          videoCaptionUrl: captionUrl,
        },
        {
          isNewRecord: true,
          userId,
        },
      );
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating lesson topic',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findAll(
    searchDto?: SearchLessonTopicDto,
  ): Promise<{ rows: LessonTopic[]; count: number }> {
    try {
      const where: any = {};
      if (searchDto) {
        if (searchDto.title) {
          where.title = { [Op.iLike]: `%${searchDto.title}%` };
        }
        if (searchDto.subtitle) {
          where.subtitle = { [Op.iLike]: `%${searchDto.subtitle}%` };
        }
        if (searchDto.lessonId) {
          where.lessonId = searchDto.lessonId;
        }
        if (searchDto.userId) {
          where.userId = searchDto.userId;
        }
        if (searchDto.description) {
          where.description = { [Op.iLike]: `%${searchDto.description}%` };
        }
        if (searchDto.mainContent) {
          where.mainContent = { [Op.iLike]: `%${searchDto.mainContent}%` };
        }
        if (searchDto.fileType) {
          where.fileType = searchDto.fileType;
        }
        if (searchDto.avatarOrCover)
          where.avatarOrCover = searchDto.avatarOrCover;
        if (searchDto.videoOrFileUrl)
          where.videoOrFileUrl = searchDto.videoOrFileUrl;
        if (searchDto.videoCaptionUrl)
          where.videoCaptionUrl = searchDto.videoCaptionUrl;
        if (searchDto.fileType) where.fileType = searchDto.fileType;
      }
      return await this.lessonTopicModel.findAndCountAll({
        where,
        limit: searchDto?.limit,
        offset: searchDto?.offset,
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching lesson topics',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async findOne(id: string): Promise<LessonTopic> {
    try {
      const topic = await this.lessonTopicModel.findByPk(id);
      if (!topic) {
        throw new NotFoundException(`Lesson topic with ID ${id} not found`);
      }
      return topic;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching lesson topic',
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
    updateDto: UpdateLessonTopicDto,
    userId: string,
    avatarOrCover?: Express.Multer.File,
    videoOrFileUrl?: Express.Multer.File,
    videoCaptionUrl?: Express.Multer.File,
  ): Promise<LessonTopic> {
    try {
      const topic = await this.findOne(id);

      // 🔒 Ownership check (Tutor can update only own topics)
      if (topic.userId !== userId) {
        throw new BadRequestException(
          'You are not allowed to update this lesson topic',
        );
      }

      // 🛡️ Defense-in-depth: block forbidden fields
      delete (updateDto as any).status;
      delete (updateDto as any).lessonId;

      const payload: Partial<LessonTopic> = {
        ...updateDto,
      };

      // 🔼 Replace avatar / cover if provided
      if (avatarOrCover) {
        payload.avatarOrCover = await this.bunnyService.upload({
          buffer: avatarOrCover.buffer,
          mimeType: avatarOrCover.mimetype,
          originalName: avatarOrCover.originalname,
          directory: 'lesson-topics',
        });
      }

      // 🔼 Replace video or file if provided
      if (videoOrFileUrl) {
        payload.videoOrFileUrl = await this.bunnyService.upload({
          buffer: videoOrFileUrl.buffer,
          mimeType: videoOrFileUrl.mimetype,
          originalName: videoOrFileUrl.originalname,
          directory: 'lesson-topics',
        });
      }

      // 🔼 Replace caption if provided
      if (videoCaptionUrl) {
        payload.videoCaptionUrl = await this.bunnyService.upload({
          buffer: videoCaptionUrl.buffer,
          mimeType: videoCaptionUrl.mimetype,
          originalName: videoCaptionUrl.originalname,
          directory: 'lesson-topics/captions',
        });
      }

      // 💾 Persist updates
      return await topic.update(payload);
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating lesson topic',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const topic = await this.findOne(id);
      await topic.destroy();
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting lesson topic',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
