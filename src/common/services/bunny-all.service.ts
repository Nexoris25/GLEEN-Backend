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

    const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;

    return `https://${hostname}/${process.env.BUNNY_STORAGE_ZONE}${normalizedPath}`;
  }

  /**
   * Upload any file type to Bunny Storage
   */
  async upload(params: {
    buffer: Buffer;
    mimeType: string;
    directory: string;
    originalName?: string;
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
      const response = await axios.put(this.getUploadUrl(fileName), buffer, {
        headers: {
          AccessKey: this.accessKey,
          'Content-Type': mimeType,
        },
        maxBodyLength: Infinity,
      });

      if (response.status !== 201) {
        throw new Error(`Unexpected status: ${response.status}`);
      }

      return `${process.env.BUNNY_PULL_ZONE_URL}/${fileName}`;
    } catch (err: unknown) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const data = axios.isAxiosError(err)
        ? (err.response?.data as unknown)
        : undefined;
      const message =
        err instanceof Error
          ? err.message
          : (() => {
              try {
                return JSON.stringify(err);
              } catch {
                return 'Unknown error';
              }
            })();

      console.error('Bunny upload failed:', {
        status,
        data,
        message,
      });

      throw new Error(
        `File upload failed: ${status || 'unknown'} - ${message}`,
      );
    }
  }

  generateUploadTarget(params: {
    directory: string;
    mimeType?: string;
    originalName?: string;
  }): {
    storagePath: string;
    uploadUrl: string;
    publicUrl: string;
  } {
    const { directory, mimeType, originalName } = params;

    let extension = '';

    if (originalName) {
      extension = path.extname(originalName);
    }

    if (!extension && mimeType?.includes('/')) {
      extension = `.${mimeType.split('/')[1]}`;
    }

    if (!extension) {
      extension = '.bin';
    }

    const safeDir = directory.replace(/^\/|\/$/g, '');
    const fileName = `${safeDir}/${uuid()}${extension}`;

    const uploadUrl = this.getUploadUrl(fileName);
    const publicUrl = `${process.env.BUNNY_PULL_ZONE_URL}/${fileName}`;

    return {
      storagePath: fileName,
      uploadUrl,
      publicUrl,
    };
  }

  async deleteByUrl(url: string): Promise<void> {
    if (!url) return;

    const cleanedUrl = String(url)
      .trim()
      .replace(/^`+|`+$/g, '')
      .replace(/^"+|"+$/g, '')
      .replace(/^'+|'+$/g, '')
      .trim();

    if (!cleanedUrl) return;

    const pullZone = (process.env.BUNNY_PULL_ZONE_URL || '')
      .trim()
      .replace(/\/+$/g, '');

    if (!pullZone) return;
    if (!cleanedUrl.startsWith(`${pullZone}/`)) return;

    const withoutPrefix = cleanedUrl.slice(pullZone.length + 1);
    const relativePath = withoutPrefix.split('?')[0]?.split('#')[0];

    if (!relativePath) return;

    const deleteUrl = this.getUploadUrl(relativePath);

    try {
      await axios.delete(deleteUrl, {
        headers: {
          AccessKey: this.accessKey,
        },
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) return;
      throw err;
    }
  }
}
