import type { Readable } from 'stream';

export interface UploadFileMeta {
  fieldName: string;
  originalName: string;
  mimeType: string;
  extension: string;
}

export interface StorageResult {
  key: string;
  url: string;
}

export interface StorageAdapter {
  save(stream: Readable, meta: UploadFileMeta): Promise<StorageResult>;
  remove?(key: string): Promise<void>;
}

export interface S3CompatibleCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

export interface S3CompatibleAdapterConfig {
  bucket: string;
  region?: string;
  endpoint?: string;
  credentials: S3CompatibleCredentials;
  keyPrefix?: string;
  publicUrlBase?: string;
  forcePathStyle?: boolean;
}

export interface S3CompatibleStorageAdapter extends StorageAdapter {
  readonly config: S3CompatibleAdapterConfig;
  exists(key: string): Promise<boolean>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

export interface MultipartLimits {
  maxFileSizeBytes?: number;
  maxFiles?: number;
  maxFields?: number;
  maxFieldSizeBytes?: number;
  maxHeaderSizeBytes?: number;
}

export interface StoredUpload extends UploadFileMeta {
  key: string;
  url: string;
  size: number;
}

export interface StreamUploadOptions {
  storage?: StorageAdapter;
  limits?: MultipartLimits;
  allowedMimeTypes?: string[];
}

export interface LocalDiskAdapterOptions {
  directory: string;
  baseUrl?: string;
  keyFor?: (meta: UploadFileMeta) => string;
}

export interface MultipartParserOptions {
  boundary: string;
  limits?: MultipartLimits;
  allowedMimeTypes?: string[];
}

export interface MultipartHandlers {
  onField(name: string, value: string): void;
  onFile(meta: UploadFileMeta, stream: Readable): void;
  onError(error: Error): void;
  onFinish(): void;
  onDrain?(): void;
}
