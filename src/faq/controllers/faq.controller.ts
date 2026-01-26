import { Controller, Post, Get, Patch, Delete, Body, Param, HttpStatus, UseGuards } from '@nestjs/common';
import stringify from 'safe-stable-stringify';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { FaqService } from '../services/faq.service';
import { CreateFaqDto } from '../dto/create-faq.dto';
import { UpdateFaqDto } from '../dto/update-faq.dto';
import { Faq } from '../models/faq.model';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';
import { AdminOnly } from 'src/auth/GuardsDecorMiddleware/AdminOnlyDecorator.guard';
import { FaqArrayResponseDto, FaqResponseCountDto, FaqResponseDto } from 'src/shared-types/response.dto';

@ApiTags('FAQs')
@Controller('faqs')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new FAQ' })
  @ApiBody({ type: CreateFaqDto })
  @UseGuards(JwtAuthGuard)
  @AdminOnly()
  @ApiResponse({ status: 201, description: 'FAQ created', type: FaqResponseDto })
  @ApiResponse({ status: 400, description: 'Error creating FAQ' })
  async create(@Body() dto: CreateFaqDto): Promise<FaqResponseDto> {
    try {
      const faq = await this.faqService.create(dto);
      return {
        status: HttpStatus.CREATED,
        message: 'FAQ created successfully',
        data: faq,
      };
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error creating FAQ',
        error: stringify({ message: error.message, ...error }),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all FAQs' })
  @ApiResponse({ status: 200, description: 'FAQs retrieved', type: FaqArrayResponseDto })
  async findAll(): Promise<FaqArrayResponseDto> {
    try {
      const faqs = await this.faqService.findAll();
      return {
        status: HttpStatus.OK,
        message: 'FAQs retrieved successfully',
        data: faqs,
      };
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Error fetching FAQs',
        error: stringify({ message: error.message, ...error }),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get FAQ by id' })
  @ApiParam({ name: 'id', description: 'FAQ ID' })
  @ApiResponse({ status: 200, description: 'FAQ retrieved', type: FaqResponseDto })
  @ApiResponse({ status: 404, description: 'FAQ not found' })
  async findOne(@Param('id') id: string): Promise<FaqResponseDto> {
    try {
      const faq = await this.faqService.findOne(id);
      return {
        status: HttpStatus.OK,
        message: 'FAQ retrieved successfully',
        data: faq,
      };
    } catch (error) {
      const status = error.status || HttpStatus.BAD_REQUEST;
      return {
        status,
        message: error.message || 'Error retrieving FAQ',
        error: stringify({ message: error.message, ...error }),
      };
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update FAQ by id' })
  @ApiParam({ name: 'id', description: 'FAQ ID' })
  @ApiBody({ type: UpdateFaqDto })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'FAQ updated', type: FaqResponseDto })
  @ApiResponse({ status: 400, description: 'Error updating FAQ', type: FaqResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateFaqDto): Promise<FaqResponseDto> {
    try {
      const faq = await this.faqService.update(id, dto);
      return {
        status: HttpStatus.OK,
        message: 'FAQ updated successfully',
        data: faq,
      };
    } catch (error) {
      const status = error.status || HttpStatus.BAD_REQUEST;
      return {
        status,
        message: error.message || 'Error updating FAQ',
        error: stringify({ message: error.message, ...error }),
      };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete FAQ by id' })
  @ApiParam({ name: 'id', description: 'FAQ ID' })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'FAQ deleted', type: FaqResponseDto })
  @ApiResponse({ status: 404, description: 'FAQ not found', type: FaqResponseDto })
  async remove(@Param('id') id: string): Promise<FaqResponseDto> {
    try {
      await this.faqService.remove(id);
      return {
        status: HttpStatus.OK,
        message: 'FAQ deleted successfully',
      };
    } catch (error) {
      const status = error.status || HttpStatus.BAD_REQUEST;
      return {
        status,
        message: error.message || 'Error deleting FAQ',
        error: stringify({ message: error.message, ...error }),
      };
    }
  }
}