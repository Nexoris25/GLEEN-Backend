// src/shared/services/image.service.ts
/*
import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class ImageService {
  async processAvatar(file: Express.Multer.File): Promise<Buffer> {
    return sharp(file.buffer)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();
  }
}
*/

import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

export interface ImageInfo {
  buffer: Buffer;       // Original image buffer (unchanged)
  width: number;        // Original width
  height: number;       // Original height
  size: number;         // Original file size in bytes
  format: string;       // Image format (jpeg, png, etc.)
}

@Injectable()
export class ImageService {
  async getImageInfo(file: Express.Multer.File): Promise<ImageInfo> {
    // Only read metadata — do NOT resize or convert
    const metadata = await sharp(file.buffer).metadata();

    return {
      buffer: file.buffer,              // Original image
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      size: file.size,                  // Original size in bytes
      format: metadata.format ?? 'unknown',
    };
  }
}
