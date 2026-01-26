// src/shared/services/bunny.service.ts
import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

@Injectable()
export class BunnyService {
  private readonly accessKey =
    process.env.BUNNY_STORAGE_PASSWORD || process.env.BUNNY_API_KEY;

  constructor() {
    if (!this.accessKey) {
      throw new Error(
        'BUNNY_STORAGE_PASSWORD (or BUNNY_API_KEY) is required for Bunny Storage',
      );
    }
    if (!process.env.BUNNY_STORAGE_ZONE) {
      throw new Error('BUNNY_STORAGE_ZONE is required');
    }
    if (!process.env.BUNNY_PULL_ZONE_URL) {
      throw new Error('BUNNY_PULL_ZONE_URL is required');
    }
  }

  private getUploadUrl(filePath: string): string {
    const region = (process.env.BUNNY_REGION || 'de').trim();

    const hostname =
      region === 'de' || region === ''
        ? 'storage.bunnycdn.com'
        : `${region}.storage.bunnycdn.com`;

    const normalizedPath = filePath.startsWith('/')
      ? filePath
      : `/${filePath}`;

    return `https://${hostname}/${process.env.BUNNY_STORAGE_ZONE}${normalizedPath}`;
  }

  /**
   * Upload any file type to Bunny Storage
   */
  async upload(params: {
    buffer: Buffer;
    mimeType: string;
    directory: string;          // e.g. "avatars"
    originalName?: string;      // from Multer
  }): Promise<string> {
    const { buffer, mimeType, directory, originalName } = params;

    // 1️⃣ Determine extension
    let extension = '';

    if (originalName) {
      extension = path.extname(originalName);
    }

    // fallback: derive extension from mime type
    if (!extension && mimeType?.includes('/')) {
      extension = `.${mimeType.split('/')[1]}`;
    }

    // final safety fallback
    if (!extension) {
      extension = '.bin';
    }

    // 2️⃣ Build path safely
    const safeDir = directory.replace(/^\/|\/$/g, '');
    const fileName = `${safeDir}/${uuid()}${extension}`;

    try {
      const response = await axios.put(
        this.getUploadUrl(fileName),
        buffer,
        {
          headers: {
            AccessKey: this.accessKey,
            'Content-Type': mimeType,
          },
          maxBodyLength: Infinity,
        },
      );

      if (response.status !== 201) {
        throw new Error(`Unexpected status: ${response.status}`);
      }

      return `${process.env.BUNNY_PULL_ZONE_URL}/${fileName}`;
    } catch (err: any) {
      console.error('Bunny upload failed:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      throw new Error(
        `File upload failed: ${err.response?.status || 'unknown'} - ${err.message}`,
      );
    }
  }

  async deleteByUrl(url: string): Promise<void> {
    if (!url) return;

    const relativePath = url.replace(
      `${process.env.BUNNY_PULL_ZONE_URL}/`,
      '',
    );

    const deleteUrl = this.getUploadUrl(relativePath);

    await axios.delete(deleteUrl, {
      headers: {
        AccessKey: this.accessKey,
      },
    });
  }
}
