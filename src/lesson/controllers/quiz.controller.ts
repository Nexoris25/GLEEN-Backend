import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseInterceptors, BadRequestException,  UploadedFile, UseGuards } from '@nestjs/common';
import { QuizCommentResponseCountDto, QuizCommentResponseDto, QuizzesResponseCountDto, QuizzesResponseDto, ResponseDto } from 'src/shared-types/response.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, ApiBearerAuth, ApiConsumes, } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import stringify from "safe-stable-stringify";
import { QuizzesService } from '../services/quiz.service';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { SearchQuizDto } from '../dto/search-quiz.dto';
import { UpdateQuizDto } from '../dto/udpdate-quiz.dto';
import { CreateQuizCommentDto } from '../dto/create-quiz-comment.dto';
import { UpdateQuizCommentDto } from '../dto/update-quiz-comment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';


@ApiTags('Quizzes')
@ApiBearerAuth()
@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizController {
constructor(private readonly quizzesService: QuizzesService) { }

@Post()
@ApiOperation({ summary: 'Create a new quiz' })
@ApiConsumes('multipart/form-data')  
@UseInterceptors(
FileInterceptor('avatar', {
limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
fileFilter: (_, file, cb) => {
if (!file.mimetype.startsWith('image/')) {
cb(new BadRequestException('Only image files are allowed'), false);
}
cb(null, true);
},}),)
/*
@ApiBody({ type: CreateQuizDto }) 
*/

@ApiBody({
schema: {
type: 'object',
properties: {
title: { type: 'string' },
 duration: { type: 'number', example: 30, description: 'Duration in minutes' },
description: { type: 'string' },
instructions: { type: 'string' },
subjectId: { type: 'string', format: 'uuid' },
avatar: { type: 'string', format: 'binary' }, // file upload
},
required: ['title', 'duration', 'subjectId'],
},
})


@ApiResponse({ status: 201, description: 'The quiz has been successfully created.', type: QuizzesResponseDto })
@ApiResponse({ status: 500, description: 'Error creating quiz', type: ResponseDto<null> })
async create(@Body() createDto: CreateQuizDto, @UserId() userId: string, @UploadedFile() avatar: Express.Multer.File,): Promise<QuizzesResponseDto> {
try {
const x = await this.quizzesService.create(createDto, userId, avatar);
return {
status: 201,
data: x,
message: 'Quiz created successfully',
};
} catch (error) {
return {
status: 500,
message: 'Error creating quiz',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}

@Get()
@ApiOperation({ summary: 'Get all quizzes' })
@ApiResponse({ status: 200, description: 'List of quizzes', type: QuizzesResponseCountDto })
@ApiResponse({ status: 500, description: 'Error fetching quizzes', type: ResponseDto<null> })
async findAll(
@Query() searchDto: SearchQuizDto
): Promise<QuizzesResponseCountDto> {
try {
const x = await this.quizzesService.findAll(searchDto);
return {
status: 200,
data: x,
message: 'Quizzes fetched successfully',
};
} catch (error) {
return {
status: 500,
message: 'Error fetching quizzes',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}

@Get(':id')
@ApiOperation({ summary: 'Get a quiz by ID' })
@ApiResponse({ status: 200, description: 'The quiz', type: QuizzesResponseDto })
@ApiResponse({ status: 404, description: 'Quiz not found', type: ResponseDto<null> })
@ApiResponse({ status: 500, description: 'Error fetching quiz', type: ResponseDto<null> })
async findById(@Param('id') id: string): Promise<QuizzesResponseDto> {
try {
const x = await this.quizzesService.findById(id);
if (!x) {
return {
status: 404,
message: 'Quiz not found',
data: null,
};
}
return {
status: 200,
data: x,
message: 'Quiz fetched successfully',
};
} catch (error) {
return {
status: 500,
message: 'Error fetching quiz',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}

@Put(':id')
@ApiOperation({ summary: 'Update a quiz by ID' })
@ApiConsumes('multipart/form-data')  
@UseInterceptors(
FileInterceptor('avatar', {
limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
fileFilter: (_, file, cb) => {
if (!file.mimetype.startsWith('image/')) {
cb(new BadRequestException('Only image files are allowed'), false);
}
cb(null, true);
},}),)

@ApiResponse({ status: 200, description: 'The quiz has been successfully updated.', type: QuizzesResponseDto })
@ApiResponse({ status: 404, description: 'Quiz not found', type: ResponseDto<null> })
@ApiResponse({ status: 500, description: 'Error updating quiz', type: ResponseDto<null> })

@ApiBody({
schema: {
type: 'object',
properties: {
title: { type: 'string' },
duration: { type: 'number', example: 30, description: 'Duration in minutes' },
description: { type: 'string' },
instructions: { type: 'string' },
subjectId: { type: 'string', format: 'uuid' },
avatar: { type: 'string', format: 'binary' }, // file upload
},
required: ['title', 'duration', 'subjectId'],
},
})
async update(@Param('id') id: string, @Body() updateDto: UpdateQuizDto, @UploadedFile() avatar: Express.Multer.File,): Promise<QuizzesResponseDto> {
try {
const x = await this.quizzesService.update(id, updateDto, avatar);
if (!x) {
return {
status: 404,
message: 'Quiz not found',
data: null,
};
}
return {
status: 200,
data: x,
message: 'Quiz updated successfully',
};
} catch (error) {
return {
status: 500,
message: 'Error updating quiz',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}

@Delete(':id')
@ApiOperation({ summary: 'Delete a quiz by ID' })
@ApiResponse({ status: 200, description: 'The quiz has been successfully deleted.', type: ResponseDto<null> })
@ApiResponse({ status: 404, description: 'Quiz not found', type: ResponseDto<null> })
@ApiResponse({ status: 500, description: 'Error deleting quiz', type: ResponseDto<null> })
async delete(@Param('id') id: string): Promise<ResponseDto<null>> {
try {
const deleted = await this.quizzesService.delete(id);
if (!deleted) {
return {
status: 404,
message: 'Quiz not found',
data: null,
};
}
return {
status: 200,
message: 'Quiz deleted successfully',
data: null,
};
} catch (error) {
return {
status: 500,
message: 'Error deleting quiz',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}


@Post('comments')
@ApiOperation({ summary: 'Create a quiz comment' })
@ApiParam({ name: 'id', description: 'Quiz ID' })
@ApiBody({ type: CreateQuizCommentDto })
@ApiResponse({ status: 201, description: 'Quiz comment created successfully', type: QuizCommentResponseDto })
@ApiResponse({ status: 404, description: 'Quiz not found', type: ResponseDto })
@ApiResponse({ status: 500, description: 'Error creating quiz comment', type: ResponseDto })
async createComment(@Body() createCommentDto: CreateQuizCommentDto, @UserId() userId: string): Promise<QuizCommentResponseDto> {
try {
const comment = await this.quizzesService.createComment(createCommentDto, userId);
return { status: 201, data: comment, message: 'Quiz comment created successfully' };
} catch (error) {
return {
status: 500,
message: 'Error creating quiz comment',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}

@Get('comments/:id')
@ApiOperation({ summary: 'Get a quiz comment by ID' })
@ApiParam({ name: 'id', description: 'Comment ID' })
@ApiResponse({ status: 200, description: 'Quiz comment retrieved successfully', type: QuizCommentResponseDto })
@ApiResponse({ status: 404, description: 'Quiz comment not found', type: ResponseDto })
@ApiResponse({ status: 500, description: 'Error retrieving quiz comment', type: ResponseDto })
async getComment(@Param('id') id: string): Promise<QuizCommentResponseDto> {
try {
const comment = await this.quizzesService.findCommentById(id);
return { status: 200, data: comment, message: 'Quiz comment retrieved successfully' };
} catch (error) {
return {
status: 500,
message: 'Error retrieving quiz comment',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}

@Get('comments/quiz/:quizId')
@ApiOperation({ summary: 'Get all comments for a quiz by quiz ID' })
@ApiParam({ name: 'quizId', description: 'Quiz ID' })
@ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of items to skip', example: 0 })
@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items to return', example: 10 })
@ApiResponse({ status: 200, description: 'Quiz comments retrieved successfully', type: QuizCommentResponseCountDto })
@ApiResponse({ status: 404, description: 'Quiz not found', type: ResponseDto })
@ApiResponse({ status: 500, description: 'Error retrieving quiz comments', type: ResponseDto })
async getCommentsByQuiz(@Param('quizId') quizId: string, @Query('offset') offset: number, @Query('limit') limit: number): Promise<QuizCommentResponseCountDto> {
try {
const comments = await this.quizzesService.findCommentByQuiz(quizId, offset, limit);
return { status: 200, data: comments, message: 'Quiz comments retrieved successfully' };
} catch (error) {
return {
status: 500,
message: 'Error retrieving quiz comments',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}

@Get('comments/quiz/:quizId/user/:userId')
@ApiOperation({ summary: 'Get quiz comment by quiz ID and user ID' })
@ApiParam({ name: 'quizId', description: 'Quiz ID' })
@ApiParam({ name: 'userId', description: 'User ID' })
@ApiResponse({ status: 200, description: 'Quiz comment retrieved successfully', type: QuizCommentResponseDto })
@ApiResponse({ status: 404, description: 'Quiz comment not found', type: ResponseDto })
@ApiResponse({ status: 500, description: 'Error retrieving quiz comment', type: ResponseDto })
async getCommentByQuizAndUser(
@Param('quizId') quizId: string,
@Param('userId') userId: string
): Promise<QuizCommentResponseDto> {
try {
const comment = await this.quizzesService.findCommentByQuizAndUser(quizId, userId);
return { status: 200, data: comment, message: 'Quiz comment retrieved successfully' };
} catch (error) {
return {
status: 500,
message: 'Error retrieving quiz comment',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}



@Put('comments/:id')
@ApiOperation({ summary: 'Update a quiz comment by ID' })
@ApiParam({ name: 'id', description: 'Comment ID' })
@ApiBody({ type: UpdateQuizCommentDto })
@ApiResponse({ status: 200, description: 'Quiz comment updated successfully', type: QuizCommentResponseDto })
@ApiResponse({ status: 404, description: 'Quiz comment not found', type: ResponseDto })
@ApiResponse({ status: 500, description: 'Error updating quiz comment', type: ResponseDto })
async updateComment(@Param('id') id: string, @Body() updateCommentDto: UpdateQuizCommentDto): Promise<QuizCommentResponseDto> {
try {
const comment = await this.quizzesService.updateComment(id, updateCommentDto);
return { status: 200, data: comment, message: 'Quiz comment updated successfully' };
} catch (error) {
return {
status: 500,
message: 'Error updating quiz comment',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}
@Delete('comments/:id')
@ApiOperation({ summary: 'Delete a quiz comment by ID' })
@ApiParam({ name: 'id', description: 'Comment ID' })
@ApiResponse({ status: 200, description: 'Quiz comment deleted successfully', schema: { example: { status: 200, message: 'Quiz comment deleted successfully' } } })
@ApiResponse({ status: 404, description: 'Quiz comment not found', type: ResponseDto })
@ApiResponse({ status: 500, description: 'Error deleting quiz comment', type: ResponseDto })
async removeComment(id: string): Promise<ResponseDto<null>> {
try {
await this.quizzesService.removeComment(id);
return { status: 200, data: null, message: 'Quiz comment deleted successfully' };
} catch (error) {
return {
status: 500,
message: 'Error deleting quiz comment',
error: stringify({
message: error.message,
stack: error.stack,
details: error.response || error,
}),
};
}
}
}