// src/common/services/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

/**
 * Thin Cloudinary client (no SDK dependency) that performs signed uploads and
 * deletes against Cloudinary's REST API. Replaces the previous Bunny Storage
 * integration.
 */
@Injectable()
export class CloudinaryService {
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName) throw new Error('CLOUDINARY_CLOUD_NAME is required');
    if (!apiKey) throw new Error('CLOUDINARY_API_KEY is required');
    if (!apiSecret) throw new Error('CLOUDINARY_API_SECRET is required');

    this.cloudName = cloudName;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  /** Sign params the Cloudinary way: sha1(sorted "k=v&..." + api_secret). */
  private sign(params: Record<string, string | number>): string {
    const toSign = Object.keys(params)
      .filter((key) => params[key] !== undefined && params[key] !== '')
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');
    return crypto
      .createHash('sha1')
      .update(toSign + this.apiSecret)
      .digest('hex');
  }

  /**
   * Object-form upload (kept API-compatible with the previous storage service):
   * `{ buffer, mimeType, directory, originalName? }`.
   */
  async upload(params: {
    buffer: Buffer;
    mimeType: string;
    directory: string;
    originalName?: string;
  }): Promise<string> {
    return this.uploadBuffer(params.buffer, {
      folder: params.directory,
      mimeType: params.mimeType,
    });
  }

  /** Upload an in-memory buffer and return its secure (https) URL. */
  async uploadBuffer(
    buffer: Buffer,
    opts: { folder?: string; mimeType?: string } = {},
  ): Promise<string> {
    const folder = (opts.folder || 'uploads').replace(/^\/|\/$/g, '');
    const mimeType = opts.mimeType || 'application/octet-stream';
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.sign({ folder, timestamp });

    const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;
    const body = new URLSearchParams({
      file: dataUri,
      api_key: this.apiKey,
      timestamp: String(timestamp),
      folder,
      signature,
    });

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`,
        body.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        },
      );
      return response.data.secure_url as string;
    } catch (err: unknown) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const data = axios.isAxiosError(err) ? err.response?.data : undefined;
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Cloudinary upload failed:', { status, data, message });
      throw new Error(`File upload failed: ${status || 'unknown'} - ${message}`);
    }
  }

  /**
   * Produce a signed target so a client can upload directly to Cloudinary.
   * The client POSTs multipart form-data (field `file` plus these fields) to
   * `uploadUrl`, and reads `secure_url` from the response.
   */
  generateUploadTarget(params: {
    directory: string;
    mimeType?: string;
    originalName?: string;
  }): {
    uploadUrl: string;
    cloudName: string;
    apiKey: string;
    timestamp: number;
    folder: string;
    signature: string;
  } {
    const folder = (params.directory || 'uploads').replace(/^\/|\/$/g, '');
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.sign({ folder, timestamp });

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`,
      cloudName: this.cloudName,
      apiKey: this.apiKey,
      timestamp,
      folder,
      signature,
    };
  }

  /** Parse the public id + resource type out of a Cloudinary delivery URL. */
  private parseUrl(
    url: string,
  ): { publicId: string; resourceType: string } | null {
    const cleaned = String(url)
      .trim()
      .replace(/^["'`]+|["'`]+$/g, '');
    const match = cleaned.match(
      /res\.cloudinary\.com\/[^/]+\/([^/]+)\/upload\/(.+)$/,
    );
    if (!match) return null;

    const resourceType = match[1]; // image | video | raw
    let rest = match[2].split('?')[0].split('#')[0];
    rest = rest.replace(/^v\d+\//, ''); // strip version prefix
    rest = rest.replace(/\.[^/.]+$/, ''); // strip extension
    if (!rest) return null;

    return { publicId: rest, resourceType };
  }

  /** Delete an asset given its Cloudinary URL (no-op for non-Cloudinary URLs). */
  async deleteByUrl(url: string): Promise<void> {
    if (!url) return;

    const parsed = this.parseUrl(url);
    if (!parsed) return; // legacy / external URL — nothing to delete

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.sign({
      public_id: parsed.publicId,
      timestamp,
    });

    const body = new URLSearchParams({
      public_id: parsed.publicId,
      api_key: this.apiKey,
      timestamp: String(timestamp),
      signature,
    });

    try {
      await axios.post(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/${parsed.resourceType}/destroy`,
        body.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) return;
      throw err;
    }
  }
}
