import { describe, expect, it, vi } from 'vitest';
import { PassThrough, type Readable } from 'stream';
import { mkdtemp, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import type { Request, Response } from 'express';
import {
  MultipartParser,
  getBoundary,
  streamUpload,
  LocalDiskStorageAdapter,
  S3StorageAdapter,
  UploadError,
} from '../src/upload';
import type { StoredUpload, UploadFileMeta, UploadRequest } from '../src/upload';
import { createPresignedUrl, sha256Hex, signAwsRequest } from '../src/upload/s3Signing.utils';
import { createServer } from 'http';
import { UNSIGNED_PAYLOAD } from '../src/upload/upload.const';

const BOUNDARY = 'HarborTestBoundary';

interface BodyPart {
  name: string;
  value?: string;
  filename?: string;
  mimeType?: string;
  content?: string;
}

function buildMultipartBody(parts: BodyPart[]): Buffer {
  const segments: string[] = [];
  parts.forEach((part) => {
    segments.push(`--${BOUNDARY}\r\n`);
    if (part.filename !== undefined) {
      segments.push(
        `Content-Disposition: form-data; name="${part.name}"; filename="${part.filename}"\r\n`
      );
      segments.push(`Content-Type: ${part.mimeType ?? 'text/plain'}\r\n\r\n`);
      segments.push(`${part.content ?? ''}\r\n`);
    } else {
      segments.push(`Content-Disposition: form-data; name="${part.name}"\r\n\r\n`);
      segments.push(`${part.value ?? ''}\r\n`);
    }
  });
  segments.push(`--${BOUNDARY}--\r\n`);
  return Buffer.from(segments.join(''));
}

interface ParseOutcome {
  fields: Record<string, string>;
  files: Array<{ meta: UploadFileMeta; content: Buffer }>;
  error: Error | null;
  finished: boolean;
}

async function parseBody(
  body: Buffer,
  chunkSize: number,
  parserOptions: ConstructorParameters<typeof MultipartParser>[0] = { boundary: BOUNDARY }
): Promise<ParseOutcome> {
  const outcome: ParseOutcome = { fields: {}, files: [], error: null, finished: false };
  const filePromises: Promise<void>[] = [];

  const parser = new MultipartParser(parserOptions, {
    onField: (name, value) => {
      outcome.fields[name] = value;
    },
    onFile: (meta, stream: Readable) => {
      const chunks: Buffer[] = [];
      const done = new Promise<void>((resolve) => {
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => {
          outcome.files.push({ meta, content: Buffer.concat(chunks) });
          resolve();
        });
        stream.on('error', () => resolve());
      });
      filePromises.push(done);
    },
    onError: (error) => {
      outcome.error = error;
    },
    onFinish: () => {
      outcome.finished = true;
    },
  });

  for (let offset = 0; offset < body.length; offset += chunkSize) {
    parser.write(body.subarray(offset, offset + chunkSize));
  }
  parser.end();
  await Promise.all(filePromises);
  return outcome;
}

describe('getBoundary', () => {
  it('extracts the boundary from a content-type header', () => {
    expect(getBoundary(`multipart/form-data; boundary=${BOUNDARY}`)).toBe(BOUNDARY);
    expect(getBoundary(`multipart/form-data; boundary="${BOUNDARY}"`)).toBe(BOUNDARY);
    expect(getBoundary('application/json')).toBeNull();
  });
});

describe('MultipartParser', () => {
  const body = buildMultipartBody([
    { name: 'title', value: 'Chat avatar' },
    { name: 'avatar', filename: 'avatar.png', mimeType: 'image/png', content: 'PNGDATA' },
  ]);

  it('parses fields and files in a single chunk', async () => {
    const outcome = await parseBody(body, body.length);

    expect(outcome.error).toBeNull();
    expect(outcome.finished).toBe(true);
    expect(outcome.fields).toEqual({ title: 'Chat avatar' });
    expect(outcome.files).toHaveLength(1);
    expect(outcome.files[0].meta).toEqual({
      fieldName: 'avatar',
      originalName: 'avatar.png',
      mimeType: 'image/png',
      extension: '.png',
    });
    expect(outcome.files[0].content.toString()).toBe('PNGDATA');
  });

  it('parses correctly when fed one byte at a time', async () => {
    const outcome = await parseBody(body, 1);

    expect(outcome.error).toBeNull();
    expect(outcome.finished).toBe(true);
    expect(outcome.fields).toEqual({ title: 'Chat avatar' });
    expect(outcome.files[0].content.toString()).toBe('PNGDATA');
  });

  it('handles multiple files and empty parts', async () => {
    const multiBody = buildMultipartBody([
      { name: 'a', filename: 'a.txt', content: 'first' },
      { name: 'empty', filename: 'empty.txt', content: '' },
      { name: 'note', value: '' },
    ]);
    const outcome = await parseBody(multiBody, 7);

    expect(outcome.error).toBeNull();
    expect(outcome.files).toHaveLength(2);
    expect(outcome.files[0].content.toString()).toBe('first');
    expect(outcome.files[1].content.toString()).toBe('');
    expect(outcome.fields).toEqual({ note: '' });
  });

  it('rejects files above the size limit with 413', async () => {
    const outcome = await parseBody(body, body.length, {
      boundary: BOUNDARY,
      limits: { maxFileSizeBytes: 3 },
    });

    expect(outcome.error).toBeInstanceOf(UploadError);
    expect((outcome.error as UploadError).statusCode).toBe(413);
    expect(outcome.finished).toBe(false);
  });

  it('rejects disallowed mime types with 415', async () => {
    const outcome = await parseBody(body, body.length, {
      boundary: BOUNDARY,
      allowedMimeTypes: ['image/jpeg'],
    });

    expect(outcome.error).toBeInstanceOf(UploadError);
    expect((outcome.error as UploadError).statusCode).toBe(415);
  });

  it('rejects when file count exceeds the limit', async () => {
    const multiBody = buildMultipartBody([
      { name: 'a', filename: 'a.txt', content: 'x' },
      { name: 'b', filename: 'b.txt', content: 'y' },
    ]);
    const outcome = await parseBody(multiBody, multiBody.length, {
      boundary: BOUNDARY,
      limits: { maxFiles: 1 },
    });

    expect(outcome.error).toBeInstanceOf(UploadError);
    expect((outcome.error as UploadError).statusCode).toBe(413);
  });

  it('errors on truncated streams', async () => {
    const truncated = body.subarray(0, body.length - 10);
    const outcome = await parseBody(truncated, truncated.length);

    expect(outcome.error).toBeInstanceOf(UploadError);
    expect(outcome.finished).toBe(false);
  });
});

describe('LocalDiskStorageAdapter', () => {
  it('saves a stream to disk and returns key and url', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'harbor-upload-'));
    const adapter = new LocalDiskStorageAdapter({ directory, baseUrl: 'https://cdn.test/files' });
    const source = new PassThrough();
    const meta: UploadFileMeta = {
      fieldName: 'file',
      originalName: 'hello.txt',
      mimeType: 'text/plain',
      extension: '.txt',
    };

    const saving = adapter.save(source, meta);
    source.end('hello adapter');
    const result = await saving;

    expect(result.url).toBe(`https://cdn.test/files/${result.key}`);
    const written = await readFile(join(directory, result.key));
    expect(written.toString()).toBe('hello adapter');

    await adapter.remove(result.key);
    await rm(directory, { recursive: true, force: true });
  });
});

interface FakeResponse {
  statusCode: number | null;
  payload: unknown;
}

function createFakeRequest(body: Buffer, contentType: string): UploadRequest {
  const stream = new PassThrough() as PassThrough & {
    get: (header: string) => string | undefined;
  };
  stream.get = (header: string) =>
    header.toLowerCase() === 'content-type' ? contentType : undefined;
  process.nextTick(() => {
    stream.end(body);
  });
  return stream as unknown as UploadRequest;
}

function createFakeResponse(state: FakeResponse): Response {
  const res = {
    status: (code: number) => {
      state.statusCode = code;
      return res;
    },
    json: (payload: unknown) => {
      state.payload = payload;
      return res;
    },
  };
  return res as unknown as Response;
}

describe('streamUpload middleware', () => {
  it('stores files, merges fields, and calls next', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'harbor-upload-mw-'));
    const body = buildMultipartBody([
      { name: 'title', value: 'Profile picture' },
      { name: 'avatar', filename: 'me.png', mimeType: 'image/png', content: 'BINARY' },
    ]);
    const req = createFakeRequest(body, `multipart/form-data; boundary=${BOUNDARY}`);
    const resState: FakeResponse = { statusCode: null, payload: null };
    const middleware = streamUpload({
      storage: new LocalDiskStorageAdapter({ directory }),
    });

    await new Promise<void>((resolve) => {
      middleware(req as unknown as Request, createFakeResponse(resState), () => resolve());
    });

    const uploads = req.uploads as StoredUpload[];
    expect(uploads).toHaveLength(1);
    expect(uploads[0].originalName).toBe('me.png');
    expect(uploads[0].size).toBe(6);
    expect((req.body as Record<string, string>).title).toBe('Profile picture');

    const written = await readFile(join(directory, uploads[0].key));
    expect(written.toString()).toBe('BINARY');

    await rm(directory, { recursive: true, force: true });
  });

  it('responds with 415 for disallowed mime types', async () => {
    const body = buildMultipartBody([
      { name: 'doc', filename: 'doc.pdf', mimeType: 'application/pdf', content: 'PDF' },
    ]);
    const req = createFakeRequest(body, `multipart/form-data; boundary=${BOUNDARY}`);
    const resState: FakeResponse = { statusCode: null, payload: null };
    const next = vi.fn();
    const middleware = streamUpload({ allowedMimeTypes: ['image/png'] });

    middleware(req as unknown as Request, createFakeResponse(resState), next);
    await vi.waitFor(() => {
      expect(resState.statusCode).toBe(415);
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('skips non-multipart requests', () => {
    const req = createFakeRequest(Buffer.from('{}'), 'application/json');
    const next = vi.fn();
    const resState: FakeResponse = { statusCode: null, payload: null };

    streamUpload()(req as unknown as Request, createFakeResponse(resState), next);

    expect(next).toHaveBeenCalledOnce();
  });
});

describe('s3Signing', () => {
  it('signs requests with stable credential scope and payload hash', () => {
    const url = new URL('https://bucket.s3.us-east-1.amazonaws.com/key.txt');
    const signed = signAwsRequest({
      method: 'PUT',
      url,
      headers: { 'content-type': 'text/plain' },
      credentials: { accessKeyId: 'AKIA', secretAccessKey: 'secret' },
      region: 'us-east-1',
      payloadHash: UNSIGNED_PAYLOAD,
      amzDate: '20260727T120000Z',
    });

    expect(signed.headers['x-amz-content-sha256']).toBe(UNSIGNED_PAYLOAD);
    expect(signed.authorization).toContain('Credential=AKIA/20260727/us-east-1/s3/aws4_request');
    expect(signed.authorization).toContain('Signature=');
    expect(sha256Hex('')).toHaveLength(64);
  });

  it('builds a presigned GET url', () => {
    const url = new URL('https://bucket.s3.us-east-1.amazonaws.com/key.txt');
    const signedUrl = createPresignedUrl({
      method: 'GET',
      url,
      credentials: { accessKeyId: 'AKIA', secretAccessKey: 'secret' },
      region: 'us-east-1',
      expiresInSeconds: 60,
    });

    expect(signedUrl).toContain('X-Amz-Algorithm=AWS4-HMAC-SHA256');
    expect(signedUrl).toContain('X-Amz-Signature=');
    expect(signedUrl).toContain('X-Amz-Expires=60');
  });
});

describe('S3StorageAdapter', () => {
  it('uploads via SigV4 PUT against an S3-compatible endpoint', async () => {
    const received: { method?: string; auth?: string; body: Buffer[] } = { body: [] };
    const server = createServer((req, res) => {
      received.method = req.method;
      received.auth = req.headers.authorization as string | undefined;
      req.on('data', (chunk: Buffer) => received.body.push(chunk));
      req.on('end', () => {
        res.statusCode = 200;
        res.end();
      });
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Failed to bind test server');
    }

    const adapter = new S3StorageAdapter({
      bucket: 'avatars',
      region: 'auto',
      endpoint: `http://127.0.0.1:${address.port}`,
      forcePathStyle: true,
      credentials: { accessKeyId: 'AKIA', secretAccessKey: 'secret' },
      publicUrlBase: 'https://cdn.test',
      keyPrefix: 'uploads',
    });

    const source = new PassThrough();
    const meta: UploadFileMeta = {
      fieldName: 'file',
      originalName: 'hello.txt',
      mimeType: 'text/plain',
      extension: '.txt',
    };
    const saving = adapter.save(source, meta);
    source.end('hello s3');
    const result = await saving;

    expect(result.key.startsWith('uploads/')).toBe(true);
    expect(result.url).toBe(`https://cdn.test/${result.key}`);
    expect(received.method).toBe('PUT');
    expect(received.auth).toContain('AWS4-HMAC-SHA256');
    expect(Buffer.concat(received.body).toString()).toBe('hello s3');

    const signed = await adapter.getSignedUrl(result.key, 120);
    expect(signed).toContain('X-Amz-Expires=120');

    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  });
});
