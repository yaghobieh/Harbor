import { createReadStream, createWriteStream } from 'fs';
import { mkdtemp, rm, stat } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import type { IncomingMessage, RequestOptions } from 'http';
import type { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type {
  S3CompatibleAdapterConfig,
  S3CompatibleStorageAdapter,
  StorageResult,
  UploadFileMeta,
} from './upload.types';
import {
  AWS_SERVICE_S3,
  DEFAULT_S3_REGION,
  DEFAULT_SIGNED_URL_EXPIRES_SECONDS,
  HTTP_METHOD_DELETE,
  HTTP_METHOD_GET,
  HTTP_METHOD_HEAD,
  HTTP_METHOD_PUT,
  HTTPS_PROTOCOL,
  S3_TEMP_FILE_PREFIX,
  UNSIGNED_PAYLOAD,
} from './upload.const';
import { HTTP_NO_CONTENT, HTTP_NOT_FOUND, HTTP_OK, HTTP_SUCCESS_MAX, KEY_RANDOM_BYTES } from './numbers.const';
import { createPresignedUrl, hashEmptyPayload, signAwsRequest } from './s3Signing.utils';

export class S3StorageAdapter implements S3CompatibleStorageAdapter {
  readonly config: S3CompatibleAdapterConfig;
  private region: string;

  constructor(config: S3CompatibleAdapterConfig) {
    this.config = config;
    this.region = config.region ?? DEFAULT_S3_REGION;
  }

  async save(stream: Readable, meta: UploadFileMeta): Promise<StorageResult> {
    const key = this.resolveKey(meta);
    const tempDir = await mkdtemp(join(tmpdir(), S3_TEMP_FILE_PREFIX));
    const tempPath = join(tempDir, 'upload.bin');
    try {
      await pipeline(stream, createWriteStream(tempPath));
      const fileStat = await stat(tempPath);
      const body = createReadStream(tempPath);
      await this.sendObjectRequest({
        method: HTTP_METHOD_PUT,
        key,
        body,
        contentType: meta.mimeType,
        contentLength: fileStat.size,
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
    return { key, url: this.publicUrlFor(key) };
  }

  async remove(key: string): Promise<void> {
    await this.sendObjectRequest({
      method: HTTP_METHOD_DELETE,
      key,
      payloadHash: hashEmptyPayload(),
    });
  }

  async exists(key: string): Promise<boolean> {
    try {
      const response = await this.sendObjectRequest({
        method: HTTP_METHOD_HEAD,
        key,
        payloadHash: hashEmptyPayload(),
      });
      return response.statusCode === HTTP_OK;
    } catch (error) {
      if (isHttpStatusError(error) && error.statusCode === HTTP_NOT_FOUND) {
        return false;
      }
      throw error;
    }
  }

  async getSignedUrl(
    key: string,
    expiresInSeconds = DEFAULT_SIGNED_URL_EXPIRES_SECONDS
  ): Promise<string> {
    const url = this.objectUrl(key);
    return createPresignedUrl({
      method: HTTP_METHOD_GET,
      url,
      credentials: this.config.credentials,
      region: this.region,
      expiresInSeconds,
      service: AWS_SERVICE_S3,
    });
  }

  private resolveKey(meta: UploadFileMeta): string {
    const random = randomBytes(KEY_RANDOM_BYTES).toString('hex');
    const baseKey = `${Date.now()}-${random}${meta.extension}`;
    const prefix = this.config.keyPrefix?.replace(/^\/+|\/+$/g, '');
    return prefix ? `${prefix}/${baseKey}` : baseKey;
  }

  private publicUrlFor(key: string): string {
    if (this.config.publicUrlBase) {
      return `${trimTrailingSlash(this.config.publicUrlBase)}/${key}`;
    }
    return this.objectUrl(key).toString();
  }

  private objectUrl(key: string): URL {
    const encodedKey = key
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    if (this.config.endpoint) {
      const endpoint = new URL(this.config.endpoint);
      if (this.config.forcePathStyle !== false) {
        endpoint.pathname = `/${this.config.bucket}/${encodedKey}`;
        return endpoint;
      }
      endpoint.hostname = `${this.config.bucket}.${endpoint.hostname}`;
      endpoint.pathname = `/${encodedKey}`;
      return endpoint;
    }

    const host = `${this.config.bucket}.s3.${this.region}.amazonaws.com`;
    return new URL(`https://${host}/${encodedKey}`);
  }

  private async sendObjectRequest(input: {
    method: string;
    key: string;
    body?: Readable;
    contentType?: string;
    contentLength?: number;
    payloadHash?: string;
  }): Promise<{ statusCode: number; body: string }> {
    const url = this.objectUrl(input.key);
    const headers: Record<string, string> = {};
    if (input.contentType) {
      headers['content-type'] = input.contentType;
    }
    if (typeof input.contentLength === 'number') {
      headers['content-length'] = String(input.contentLength);
    }

    const signed = signAwsRequest({
      method: input.method,
      url,
      headers,
      credentials: this.config.credentials,
      region: this.region,
      service: AWS_SERVICE_S3,
      payloadHash: input.payloadHash ?? UNSIGNED_PAYLOAD,
    });

    return await httpRequestAsync(url, {
      method: input.method,
      headers: signed.headers,
      body: input.body,
    });
  }
}

export function createS3StorageAdapter(
  config: S3CompatibleAdapterConfig
): S3StorageAdapter {
  return new S3StorageAdapter(config);
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

class HttpStatusError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

function isHttpStatusError(error: unknown): error is HttpStatusError {
  return error instanceof HttpStatusError;
}

function httpRequestAsync(
  url: URL,
  options: {
    method: string;
    headers: Record<string, string>;
    body?: Readable;
  }
): Promise<{ statusCode: number; body: string }> {
  const requestImpl = url.protocol === HTTPS_PROTOCOL ? httpsRequest : httpRequest;
  const requestOptions: RequestOptions = {
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port || undefined,
    path: `${url.pathname}${url.search}`,
    method: options.method,
    headers: options.headers,
  };

  return new Promise((resolve, reject) => {
    const req = requestImpl(requestOptions, (res: IncomingMessage) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const statusCode = res.statusCode ?? 0;
        const body = Buffer.concat(chunks).toString('utf8');
        if (
          (statusCode >= HTTP_OK && statusCode < HTTP_SUCCESS_MAX) ||
          statusCode === HTTP_NO_CONTENT
        ) {
          resolve({ statusCode, body });
          return;
        }
        reject(new HttpStatusError(statusCode, body || `S3 request failed with ${statusCode}`));
      });
    });

    req.on('error', reject);

    if (options.body) {
      options.body.pipe(req);
      options.body.on('error', (error) => {
        req.destroy(error);
        reject(error);
      });
      return;
    }

    req.end();
  });
}
