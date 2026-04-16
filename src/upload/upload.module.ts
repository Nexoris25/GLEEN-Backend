import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { BunnyService } from 'src/common/services/bunny-all.service';

@Module({
  controllers: [UploadController],
  providers: [BunnyService],
  exports: [BunnyService],
})
export class UploadModule {}
