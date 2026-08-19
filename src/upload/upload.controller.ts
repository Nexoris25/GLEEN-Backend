import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from 'src/common/services/cloudinary.service';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('presign')
  @ApiOperation({
    summary:
      'Generate a signed Cloudinary upload target for arbitrary files (e.g. avatars)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        directory: { type: 'string', example: 'subjects' },
        mimeType: { type: 'string', example: 'image/png' },
        originalName: { type: 'string', example: 'avatar.png' },
      },
      required: ['directory'],
    },
  })
  presign(
    @Body('directory') directory: string,
    @Body('mimeType') mimeType?: string,
    @Body('originalName') originalName?: string,
  ) {
    return this.cloudinaryService.generateUploadTarget({
      directory,
      mimeType,
      originalName,
    });
  }
}
