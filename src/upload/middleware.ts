import type { Request, RequestHandler } from 'express';
import { Transform } from 'stream';
import { createLogger } from '../utils/logger';
import { CONTENT_TYPES, HTTP_STATUS } from '../constants';
import type { StoredUpload, StreamUploadOptions } from './upload.types';
import { MultipartParser, getBoundary } from './multipart';
import { LocalDiskStorageAdapter } from './localDiskAdapter';
import { UploadError } from './uploadError';
import { DEFAULT_UPLOAD_DIRECTORY, MISSING_BOUNDARY_MESSAGE } from './upload.const';

const logger = createLogger('upload');

export interface UploadRequest extends Request {
  uploads?: StoredUpload[];
}

export function streamUpload(options: StreamUploadOptions = {}): RequestHandler {
  const storage =
    options.storage ?? new LocalDiskStorageAdapter({ directory: DEFAULT_UPLOAD_DIRECTORY });

  return (req, res, next) => {
    const contentType = req.get('content-type') ?? '';
    if (!contentType.includes(CONTENT_TYPES.MULTIPART)) {
      next();
      return;
    }

    const boundary = getBoundary(contentType);
    if (!boundary) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { message: MISSING_BOUNDARY_MESSAGE },
      });
      return;
    }

    const uploads: StoredUpload[] = [];
    const fields: Record<string, string> = {};
    const savePromises: Promise<void>[] = [];
    let failed = false;

    const fail = (error: Error): void => {
      if (failed) return;
      failed = true;
      const statusCode =
        error instanceof UploadError ? error.statusCode : HTTP_STATUS.BAD_REQUEST;
      logger.error(`Upload failed: ${error.message}`);
      req.resume();
      res.status(statusCode).json({
        success: false,
        error: { message: error.message },
      });
    };

    const parser = new MultipartParser(
      {
        boundary,
        limits: options.limits,
        allowedMimeTypes: options.allowedMimeTypes,
      },
      {
        onField: (name, value) => {
          fields[name] = value;
        },
        onFile: (meta, stream) => {
          let size = 0;
          const counting = new Transform({
            transform(chunk: Buffer, _encoding, callback) {
              size += chunk.length;
              callback(null, chunk);
            },
          });
          stream.on('error', (error: Error) => counting.destroy(error));
          stream.pipe(counting);
          const saving = storage
            .save(counting, meta)
            .then((result) => {
              uploads.push({ ...meta, ...result, size });
            })
            .catch((error: Error) => {
              stream.resume();
              fail(error);
            });
          savePromises.push(saving);
        },
        onError: fail,
        onFinish: () => {
          void Promise.all(savePromises).then(() => {
            if (failed) return;
            const uploadRequest = req as UploadRequest;
            uploadRequest.uploads = uploads;
            uploadRequest.body = { ...(uploadRequest.body as Record<string, unknown>), ...fields };
            logger.debug(`Stored ${uploads.length} uploads`);
            next();
          });
        },
        onDrain: () => {
          req.resume();
        },
      }
    );

    req.on('data', (chunk: Buffer) => {
      if (!parser.write(chunk)) {
        req.pause();
      }
    });

    req.on('end', () => {
      parser.end();
    });

    req.on('error', (error: Error) => {
      fail(error);
    });
  };
}
