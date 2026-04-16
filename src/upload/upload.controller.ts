import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BunnyService } from 'src/common/services/bunny-all.service';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadController {
  constructor(private readonly bunnyService: BunnyService) {}

  @Post('presign')
  @ApiOperation({
    summary: 'Generate Bunny upload target for arbitrary file (e.g. avatars)',
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
    return this.bunnyService.generateUploadTarget({
      directory,
      mimeType,
      originalName,
    });
  }
}
