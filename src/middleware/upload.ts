// File Upload Middleware for Harbor
import { RequestHandler } from 'express';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { createLogger } from '../utils/logger';
import { HTTP_STATUS } from '../constants';

const logger = createLogger('upload');

export interface UploadOptions {
  dest?: string;
  limits?: {
    fileSize?: number;
    files?: number;
    fields?: number;
    fieldSize?: number;
  };
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  filename?: (originalName: string, mimeType: string) => string;
  storage?: 'disk' | 'memory';
  onFileBegin?: (fieldName: string, file: UploadedFile) => void;
  onFileEnd?: (fieldName: string, file: UploadedFile) => void;
  onError?: (error: Error) => void;
}

export interface UploadedFile {
  fieldName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path?: string;
  buffer?: Buffer;
  encoding: string;
}

interface MultipartPart {
  fieldName: string;
  filename?: string;
  mimeType: string;
  encoding: string;
  data: Buffer[];
}

/**
 * Parse multipart boundary from content-type header
 */
function getBoundary(contentType: string): string | null {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match ? match[1] || match[2] : null;
}

/**
 * Parse multipart form data
 */
function parseMultipart(buffer: Buffer, boundary: string): MultipartPart[] {
  const parts: MultipartPart[] = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const endBoundary = Buffer.from(`--${boundary}--`);
  
  let start = buffer.indexOf(boundaryBuffer) + boundaryBuffer.length + 2; // Skip CRLF
  
  while (start < buffer.length) {
    const end = buffer.indexOf(boundaryBuffer, start);
    if (end === -1) break;
    
    const partData = buffer.slice(start, end - 2); // Remove trailing CRLF
    const headerEnd = partData.indexOf('\r\n\r\n');
    
    if (headerEnd !== -1) {
      const headers = partData.slice(0, headerEnd).toString();
      const body = partData.slice(headerEnd + 4);
      
      const contentDisposition = headers.match(/Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i);
      const contentType = headers.match(/Content-Type:\s*([^\r\n]+)/i);
      const encoding = headers.match(/Content-Transfer-Encoding:\s*([^\r\n]+)/i);
      
      if (contentDisposition) {
        parts.push({
          fieldName: contentDisposition[1],
          filename: contentDisposition[2],
          mimeType: contentType ? contentType[1] : 'application/octet-stream',
          encoding: encoding ? encoding[1] : '7bit',
          data: [body],
        });
      }
    }
    
    start = end + boundaryBuffer.length + 2;
    
    // Check for end boundary
    if (buffer.slice(end, end + endBoundary.length).equals(endBoundary)) {
      break;
    }
  }
  
  return parts;
}

/**
 * Generate unique filename
 */
function generateFilename(originalName: string): string {
  const ext = extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}${ext}`;
}

/**
 * File upload middleware
 * 
 * @example
 * // Single file upload
 * app.post('/upload', upload({ dest: './uploads' }), (req, res) => {
 *   console.log(req.file);
 *   res.json({ uploaded: true });
 * });
 * 
 * // Multiple files
 * app.post('/uploads', upload({ dest: './uploads', limits: { files: 10 } }), (req, res) => {
 *   console.log(req.files);
 *   res.json({ count: req.files.length });
 * });
 * 
 * // Memory storage
 * app.post('/buffer', upload({ storage: 'memory' }), (req, res) => {
 *   const buffer = req.file.buffer;
 *   // Process buffer...
 * });
 */
export function upload(options: UploadOptions = {}): RequestHandler {
  const {
    dest = './uploads',
    limits = {},
    allowedMimeTypes,
    allowedExtensions,
    filename = generateFilename,
    storage = 'disk',
    onFileBegin,
    onFileEnd,
    onError,
  } = options;

  const {
    fileSize = 10 * 1024 * 1024, // 10MB default
    files = 10,
    fields = 100,
    fieldSize = 1024 * 1024, // 1MB default
  } = limits;

  // Ensure upload directory exists
  if (storage === 'disk' && !existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  return async (req, res, next) => {
    const contentType = req.get('content-type') || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return next();
    }

    const boundary = getBoundary(contentType);
    if (!boundary) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: { message: 'Missing boundary in content-type' },
      });
    }

    const chunks: Buffer[] = [];
    let totalSize = 0;

    req.on('data', (chunk: Buffer) => {
      totalSize += chunk.length;
      if (totalSize > fileSize * files) {
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const parts = parseMultipart(buffer, boundary);

        const uploadedFiles: UploadedFile[] = [];
        const formFields: Record<string, string> = {};
        let fileCount = 0;
        let fieldCount = 0;

        for (const part of parts) {
          if (part.filename) {
            // File upload
            if (fileCount >= files) {
              throw new Error(`Too many files. Maximum: ${files}`);
            }

            const fileBuffer = Buffer.concat(part.data);
            
            if (fileBuffer.length > fileSize) {
              throw new Error(`File too large: ${part.filename}. Maximum: ${fileSize} bytes`);
            }

            // Check mime type
            if (allowedMimeTypes && !allowedMimeTypes.includes(part.mimeType)) {
              throw new Error(`Invalid file type: ${part.mimeType}`);
            }

            // Check extension
            if (allowedExtensions) {
              const ext = extname(part.filename).toLowerCase().slice(1);
              if (!allowedExtensions.includes(ext)) {
                throw new Error(`Invalid file extension: ${ext}`);
              }
            }

            const file: UploadedFile = {
              fieldName: part.fieldName,
              originalName: part.filename,
              mimeType: part.mimeType,
              size: fileBuffer.length,
              encoding: part.encoding,
            };

            onFileBegin?.(part.fieldName, file);

            if (storage === 'disk') {
              const newFilename = filename(part.filename, part.mimeType);
              const filePath = join(dest, newFilename);
              
              await new Promise<void>((resolve, reject) => {
                const writeStream = createWriteStream(filePath);
                writeStream.write(fileBuffer);
                writeStream.end();
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
              });

              file.path = filePath;
            } else {
              file.buffer = fileBuffer;
            }

            onFileEnd?.(part.fieldName, file);
            uploadedFiles.push(file);
            fileCount++;
          } else {
            // Form field
            if (fieldCount >= fields) {
              throw new Error(`Too many fields. Maximum: ${fields}`);
            }

            const value = Buffer.concat(part.data).toString();
            if (value.length > fieldSize) {
              throw new Error(`Field too large: ${part.fieldName}`);
            }

            formFields[part.fieldName] = value;
            fieldCount++;
          }
        }

        // Attach to request
        (req as any).files = uploadedFiles;
        (req as any).file = uploadedFiles[0];
        (req as any).body = { ...(req as any).body, ...formFields };

        logger.debug(`Uploaded ${uploadedFiles.length} files`);
        next();
      } catch (err) {
        const error = err as Error;
        logger.error(`Upload error: ${error.message}`);
        onError?.(error);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: { message: error.message },
        });
      }
    });

    req.on('error', (err) => {
      logger.error('Request error:', err);
      onError?.(err as Error);
      next(err as Error);
    });
  };
}

/**
 * Validate file type helper
 */
export function validateFileType(
  file: UploadedFile,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(file.mimeType);
}

/**
 * Get file extension from mime type
 */
export function mimeToExtension(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
    'application/json': 'json',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
  };

  return mimeMap[mimeType] || 'bin';
}

