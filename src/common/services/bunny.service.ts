// src/shared/services/bunny.service.ts
import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

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

  private getUploadUrl(fileName: string) {
    const region = (process.env.BUNNY_REGION || 'de').trim();
    const hostname =
      region === 'de' || region === ''
        ? 'storage.bunnycdn.com'
        : `${region}.storage.bunnycdn.com`;

    const normalizedFileName = fileName.startsWith('/')
      ? fileName
      : `/${fileName}`;
    return `https://${hostname}/${process.env.BUNNY_STORAGE_ZONE}${normalizedFileName}`;
  }

  async upload(buffer: Buffer, mime: string): Promise<string> {
    const fileName = `avatars/${uuid()}.jpg`;

    try {
      const response = await axios.put(this.getUploadUrl(fileName), buffer, {
        headers: {
          AccessKey: this.accessKey, // ← this must be the zone Password
          'Content-Type': mime,
        },
        maxBodyLength: Infinity,
      });

      if (response.status !== 201) {
        // Bunny PUT upload returns 201 Created on success
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
        `Avatar upload failed: ${err.response?.status || 'unknown'} - ${err.message}`,
      );
    }
  }

  async deleteByUrl(url: string) {
    if (!url) return;

    const path = url.replace(`${process.env.BUNNY_PULL_ZONE_URL}/`, '');
    const deleteUrl = this.getUploadUrl(path);

    await axios.delete(deleteUrl, {
      headers: {
        AccessKey: process.env.BUNNY_API_KEY,
      },
    });
  }
}
