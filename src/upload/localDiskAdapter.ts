import { createWriteStream } from 'fs';
import { mkdir, rm } from 'fs/promises';
import { randomBytes } from 'crypto';
import { dirname, join, resolve } from 'path';
import type { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type {
  LocalDiskAdapterOptions,
  StorageAdapter,
  StorageResult,
  UploadFileMeta,
} from './upload.types';
import { KEY_RANDOM_BYTES } from './numbers.const';

export class LocalDiskStorageAdapter implements StorageAdapter {
  private options: LocalDiskAdapterOptions;

  constructor(options: LocalDiskAdapterOptions) {
    this.options = options;
  }

  async save(stream: Readable, meta: UploadFileMeta): Promise<StorageResult> {
    const key = this.options.keyFor?.(meta) ?? defaultKey(meta);
    const filePath = resolve(join(this.options.directory, key));
    await mkdir(dirname(filePath), { recursive: true });
    await pipeline(stream, createWriteStream(filePath));
    const url = this.options.baseUrl
      ? `${trimTrailingSlash(this.options.baseUrl)}/${key}`
      : filePath;
    return { key, url };
  }

  async remove(key: string): Promise<void> {
    const filePath = resolve(join(this.options.directory, key));
    await rm(filePath, { force: true });
  }
}

export function createLocalDiskAdapter(options: LocalDiskAdapterOptions): LocalDiskStorageAdapter {
  return new LocalDiskStorageAdapter(options);
}

function defaultKey(meta: UploadFileMeta): string {
  const random = randomBytes(KEY_RANDOM_BYTES).toString('hex');
  return `${Date.now()}-${random}${meta.extension}`;
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}
