import { PassThrough } from 'stream';
import { extname } from 'path';
import { HTTP_STATUS } from '../constants';
import type {
  MultipartHandlers,
  MultipartLimits,
  MultipartParserOptions,
  UploadFileMeta,
} from './upload.types';
import { UploadError } from './uploadError';
import {
  BOUNDARY_CLOSE,
  BOUNDARY_PATTERN,
  CONTENT_DISPOSITION_PATTERN,
  CONTENT_TYPE_PATTERN,
  CRLF,
  DEFAULT_PART_MIME_TYPE,
  FIELD_TOO_LARGE_MESSAGE,
  FILE_TOO_LARGE_MESSAGE,
  HEADER_SEPARATOR,
  HEADER_TOO_LARGE_MESSAGE,
  MALFORMED_MULTIPART_MESSAGE,
  MIME_NOT_ALLOWED_MESSAGE,
  TOO_MANY_FIELDS_MESSAGE,
  TOO_MANY_FILES_MESSAGE,
  UNEXPECTED_END_MESSAGE,
} from './upload.const';
import {
  BOUNDARY_TAIL_LENGTH,
  DEFAULT_MAX_FIELD_SIZE_BYTES,
  DEFAULT_MAX_FIELDS,
  DEFAULT_MAX_FILE_SIZE_BYTES,
  DEFAULT_MAX_FILES,
  DEFAULT_MAX_HEADER_SIZE_BYTES,
} from './numbers.const';

type ParserState = 'preamble' | 'boundaryTail' | 'header' | 'body' | 'done';

interface CurrentFilePart {
  kind: 'file';
  stream: PassThrough;
  bytes: number;
}

interface CurrentFieldPart {
  kind: 'field';
  name: string;
  chunks: Buffer[];
  bytes: number;
}

type CurrentPart = CurrentFilePart | CurrentFieldPart;

export function getBoundary(contentType: string): string | null {
  const match = contentType.match(BOUNDARY_PATTERN);
  return match ? match[1] || match[2] : null;
}

export class MultipartParser {
  private buffer: Buffer = Buffer.alloc(0);
  private state: ParserState = 'preamble';
  private readonly firstDelimiter: Buffer;
  private readonly delimiter: Buffer;
  private readonly limits: Required<MultipartLimits>;
  private readonly allowedMimeTypes?: string[];
  private readonly handlers: MultipartHandlers;
  private currentPart: CurrentPart | null = null;
  private fileCount = 0;
  private fieldCount = 0;
  private settled = false;
  private lastWriteOk = true;

  constructor(options: MultipartParserOptions, handlers: MultipartHandlers) {
    this.firstDelimiter = Buffer.from(`${BOUNDARY_CLOSE}${options.boundary}`);
    this.delimiter = Buffer.from(`${CRLF}${BOUNDARY_CLOSE}${options.boundary}`);
    this.limits = resolveLimits(options.limits);
    this.allowedMimeTypes = options.allowedMimeTypes;
    this.handlers = handlers;
  }

  write(chunk: Buffer): boolean {
    if (this.state === 'done') return true;
    this.lastWriteOk = true;
    this.buffer = this.buffer.length === 0 ? chunk : Buffer.concat([this.buffer, chunk]);
    this.process();
    return this.lastWriteOk;
  }

  end(): void {
    if (this.state === 'done') return;
    this.fail(new UploadError(UNEXPECTED_END_MESSAGE));
  }

  private process(): void {
    let progressing = true;
    while (progressing && this.state !== 'done') {
      switch (this.state) {
        case 'preamble':
          progressing = this.processPreamble();
          break;
        case 'boundaryTail':
          progressing = this.processBoundaryTail();
          break;
        case 'header':
          progressing = this.processHeader();
          break;
        case 'body':
          progressing = this.processBody();
          break;
      }
    }
  }

  private processPreamble(): boolean {
    const index = this.buffer.indexOf(this.firstDelimiter);
    if (index === -1) {
      const keep = this.firstDelimiter.length - 1;
      if (this.buffer.length > keep) {
        this.buffer = this.buffer.subarray(this.buffer.length - keep);
      }
      return false;
    }
    this.buffer = this.buffer.subarray(index + this.firstDelimiter.length);
    this.state = 'boundaryTail';
    return true;
  }

  private processBoundaryTail(): boolean {
    if (this.buffer.length < BOUNDARY_TAIL_LENGTH) return false;
    const tail = this.buffer.subarray(0, BOUNDARY_TAIL_LENGTH).toString();
    if (tail === BOUNDARY_CLOSE) {
      this.finish();
      return false;
    }
    if (tail === CRLF) {
      this.buffer = this.buffer.subarray(BOUNDARY_TAIL_LENGTH);
      this.state = 'header';
      return true;
    }
    this.fail(new UploadError(MALFORMED_MULTIPART_MESSAGE));
    return false;
  }

  private processHeader(): boolean {
    const index = this.buffer.indexOf(HEADER_SEPARATOR);
    if (index === -1) {
      if (this.buffer.length > this.limits.maxHeaderSizeBytes) {
        this.fail(new UploadError(HEADER_TOO_LARGE_MESSAGE));
      }
      return false;
    }
    const headerBlock = this.buffer.subarray(0, index).toString();
    this.buffer = this.buffer.subarray(index + HEADER_SEPARATOR.length);
    this.beginPart(headerBlock);
    return this.state === 'body';
  }

  private beginPart(headerBlock: string): void {
    const disposition = headerBlock.match(CONTENT_DISPOSITION_PATTERN);
    if (!disposition) {
      this.fail(new UploadError(MALFORMED_MULTIPART_MESSAGE));
      return;
    }

    const fieldName = disposition[1];
    const filename = disposition[2];

    if (filename !== undefined) {
      if (this.fileCount >= this.limits.maxFiles) {
        this.fail(new UploadError(TOO_MANY_FILES_MESSAGE, HTTP_STATUS.PAYLOAD_TOO_LARGE));
        return;
      }
      const contentType = headerBlock.match(CONTENT_TYPE_PATTERN);
      const mimeType = contentType ? contentType[1].trim() : DEFAULT_PART_MIME_TYPE;

      if (this.allowedMimeTypes && !this.allowedMimeTypes.includes(mimeType)) {
        this.fail(
          new UploadError(
            `${MIME_NOT_ALLOWED_MESSAGE}: ${mimeType}`,
            HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE
          )
        );
        return;
      }

      this.fileCount += 1;
      const stream = new PassThrough();
      stream.on('drain', () => this.handlers.onDrain?.());
      this.currentPart = { kind: 'file', stream, bytes: 0 };
      this.state = 'body';

      const meta: UploadFileMeta = {
        fieldName,
        originalName: filename,
        mimeType,
        extension: extname(filename).toLowerCase(),
      };
      this.handlers.onFile(meta, stream);
      return;
    }

    if (this.fieldCount >= this.limits.maxFields) {
      this.fail(new UploadError(TOO_MANY_FIELDS_MESSAGE));
      return;
    }
    this.fieldCount += 1;
    this.currentPart = { kind: 'field', name: fieldName, chunks: [], bytes: 0 };
    this.state = 'body';
  }

  private processBody(): boolean {
    const index = this.buffer.indexOf(this.delimiter);
    if (index === -1) {
      const keep = this.delimiter.length - 1;
      if (this.buffer.length > keep) {
        const data = this.buffer.subarray(0, this.buffer.length - keep);
        this.buffer = this.buffer.subarray(this.buffer.length - keep);
        this.emitPartData(data);
      }
      return false;
    }
    const data = this.buffer.subarray(0, index);
    this.buffer = this.buffer.subarray(index + this.delimiter.length);
    this.emitPartData(data);
    if (this.settled) return false;
    this.endPart();
    this.state = 'boundaryTail';
    return true;
  }

  private emitPartData(data: Buffer): void {
    if (!this.currentPart || data.length === 0 || this.settled) return;

    if (this.currentPart.kind === 'file') {
      this.currentPart.bytes += data.length;
      if (this.currentPart.bytes > this.limits.maxFileSizeBytes) {
        this.fail(new UploadError(FILE_TOO_LARGE_MESSAGE, HTTP_STATUS.PAYLOAD_TOO_LARGE));
        return;
      }
      const ok = this.currentPart.stream.write(data);
      if (!ok) this.lastWriteOk = false;
      return;
    }

    this.currentPart.bytes += data.length;
    if (this.currentPart.bytes > this.limits.maxFieldSizeBytes) {
      this.fail(new UploadError(FIELD_TOO_LARGE_MESSAGE, HTTP_STATUS.PAYLOAD_TOO_LARGE));
      return;
    }
    this.currentPart.chunks.push(Buffer.from(data));
  }

  private endPart(): void {
    if (!this.currentPart || this.settled) return;
    if (this.currentPart.kind === 'file') {
      this.currentPart.stream.end();
    } else {
      this.handlers.onField(
        this.currentPart.name,
        Buffer.concat(this.currentPart.chunks).toString()
      );
    }
    this.currentPart = null;
  }

  private finish(): void {
    if (this.settled) return;
    this.settled = true;
    this.state = 'done';
    this.handlers.onFinish();
  }

  private fail(error: Error): void {
    if (this.settled) return;
    this.settled = true;
    this.state = 'done';
    if (this.currentPart?.kind === 'file') {
      this.currentPart.stream.destroy(error);
    }
    this.currentPart = null;
    this.handlers.onError(error);
  }
}

function resolveLimits(limits: MultipartLimits = {}): Required<MultipartLimits> {
  return {
    maxFileSizeBytes: limits.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES,
    maxFiles: limits.maxFiles ?? DEFAULT_MAX_FILES,
    maxFields: limits.maxFields ?? DEFAULT_MAX_FIELDS,
    maxFieldSizeBytes: limits.maxFieldSizeBytes ?? DEFAULT_MAX_FIELD_SIZE_BYTES,
    maxHeaderSizeBytes: limits.maxHeaderSizeBytes ?? DEFAULT_MAX_HEADER_SIZE_BYTES,
  };
}
