// src/common/modules/cloudinary.module.ts
import { Module } from '@nestjs/common';
import { CloudinaryService } from '../services/cloudinary.service';

@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
