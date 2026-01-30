import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import stringify from "safe-stable-stringify";
import { Op } from 'sequelize';
import { Quizzes } from '../models/quiz.model';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { SearchQuizDto } from '../dto/search-quiz.dto';
import { UpdateQuizDto } from '../dto/udpdate-quiz.dto';
import { CreateQuizCommentDto } from '../dto/create-quiz-comment.dto';
import { QuizComment } from '../models/quiz_comment.model';
import { UpdateQuizCommentDto } from '../dto/update-quiz-comment.dto';
import { BunnyService } from 'src/common/services/bunny-all.service';

@Injectable()
export class QuizzesService {
constructor(
@InjectModel(Quizzes)
private quizzesModel: typeof Quizzes,
private readonly bunnyService: BunnyService,
@InjectModel(QuizComment)
private quizCommentModel: typeof QuizComment,
) { }

async create(createDto: CreateQuizDto, userId: string, avatar?: Express.Multer.File,): Promise<Quizzes> {
// 1️⃣ Check if a quiz with the same title already exists
const existingQuiz = await this.quizzesModel.findOne({
where: { title: createDto.title },
});

if (existingQuiz) {
throw new BadRequestException(
`A quiz with the title "${createDto.title}" already exists.`,
);
}

try {
let imageUrl: string | null = null;
if (avatar) {
imageUrl = await this.bunnyService.upload({
buffer: avatar.buffer,
mimeType: avatar.mimetype,
originalName: avatar.originalname,
directory: 'quiz',
});
}

const quiz = await this.quizzesModel.create(
  {
    ...createDto,
    userId,             // logged-in user
    avatar: imageUrl, // or rename to avatar if that’s your column
  } as Omit<Quizzes, 'id'>,
  {
    isNewRecord: true,
    userId,
  }
);


return quiz;
} catch (error) {
throw new BadRequestException({
message: 'Error creating quiz:',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}

async findAll(options: SearchQuizDto): Promise<{ rows: Quizzes[]; count: number }> {
try {
const { limit, offset, ...where } = options;
const whereOptions: any = { ...where };
if (options.userId) {
whereOptions.userId = options.userId;
}
if (options.subjectId) {
whereOptions.subjectId = options.subjectId;
}

if (options.status) {
whereOptions.status = options.status;
}
if (options.title) {
whereOptions.title = { [Op.iLike]: `%${options.title}%` };
}
if (options.description) {
whereOptions.description = { [Op.iLike]: `%${options.description}%` };
}
if (options.duration) {
whereOptions.duration = { [Op.iLike]: `%${options.duration}%` };
}
if (options.instructions) {
whereOptions.instructions = { [Op.iLike]: `%${options.instructions}%` };
}
return await this.quizzesModel.findAndCountAll({
where: whereOptions,
limit,
offset,
});
} catch (error) {
throw new BadRequestException({
message: 'Error fetching quizzes:',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}

async findById(id: string): Promise<Quizzes | null> {
try {
return await this.quizzesModel.findByPk(id);
} catch (error) {
throw new BadRequestException({
message: 'Error fetching quiz by ID:',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}

async update(id: string, updateDto: UpdateQuizDto, avatar?: Express.Multer.File,): Promise<Quizzes | null> {
try {
const quiz = await this.quizzesModel.findByPk(id);

if (!quiz) {
throw new Error('Quiz not found');
}

let imageUrl: string | null = null;

// Upload avatar only if sent
if (avatar) {
imageUrl = await this.bunnyService.upload({
buffer: avatar.buffer,
mimeType: avatar.mimetype,
originalName: avatar.originalname,
directory: 'quiz',
});
}

// Merge avatar into update payload if uploaded
const returnURL = await quiz.update({
...updateDto,
...(imageUrl && { avatar: imageUrl }),
});

return returnURL;
} catch (error) {
throw new BadRequestException({
message: 'Error updating quiz:',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}

async delete(id: string): Promise<boolean> {
try {
const deletedCount = await this.quizzesModel.destroy({ where: { id } });
return deletedCount > 0;
} catch (error) {
throw new BadRequestException({
message: 'Error deleting quiz:',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}




async createComment(createCommentDto: CreateQuizCommentDto, userId: string): Promise<QuizComment> {
try {
const comment = await this.quizCommentModel.create({ ...createCommentDto, userId }, { isNewRecord: true, userId });
return comment;
} catch (error) {
throw new BadRequestException({
message: 'Error creating quiz comment',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}

async findCommentById(id: string): Promise<QuizComment> {
try {
const comment = await this.quizCommentModel.findByPk(id);
if (!comment) {
throw new NotFoundException(`Comment with id ${id} not found`);
}
return comment;
} catch (error) {
throw new BadRequestException({
message: 'Error finding quiz comment',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}

async findCommentByQuiz(quizId: string, offset: number, limit: number): Promise<{ count: number; rows: QuizComment[] }> {
try {
const comments = await this.quizCommentModel.findAndCountAll({ where: { quizId }, offset, limit });
return comments;
} catch (error) {
throw new BadRequestException({
message: 'Error finding quiz comments',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
};

async findCommentByQuizAndUser(quizId: string, userId: string): Promise<QuizComment | null> {
try {
const comment = await this.quizCommentModel.findOne({ where: { quizId, userId } });
return comment;
} catch (error) {
throw new BadRequestException({
message: 'Error finding quiz comment by quiz and user',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
};

async updateComment(id: string, updateCommentDto: UpdateQuizCommentDto): Promise<QuizComment> {
try {
const comment = await this.findCommentById(id);
Object.assign(comment, updateCommentDto);
return await comment.save();
} catch (error) {
throw new BadRequestException({
message: 'Error updating quiz comment',
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
message: 'Error deleting quiz comment',
details: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
});
}
}


}
