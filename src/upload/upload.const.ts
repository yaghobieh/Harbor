export const CRLF = '\r\n';

export const HEADER_SEPARATOR = '\r\n\r\n';

export const BOUNDARY_CLOSE = '--';

export const BOUNDARY_PATTERN = /boundary=(?:"([^"]+)"|([^;]+))/i;

export const CONTENT_DISPOSITION_PATTERN =
  /Content-Disposition:\s*form-data;\s*name="([^"]*)"(?:;\s*filename="([^"]*)")?/i;

export const CONTENT_TYPE_PATTERN = /Content-Type:\s*([^\r\n;]+)/i;

export const DEFAULT_PART_MIME_TYPE = 'application/octet-stream';

export const DEFAULT_UPLOAD_DIRECTORY = './uploads';

export const MALFORMED_MULTIPART_MESSAGE = 'Malformed multipart stream';

export const UNEXPECTED_END_MESSAGE = 'Unexpected end of multipart stream';

export const HEADER_TOO_LARGE_MESSAGE = 'Multipart part headers too large';

export const TOO_MANY_FILES_MESSAGE = 'Too many files in multipart request';

export const TOO_MANY_FIELDS_MESSAGE = 'Too many fields in multipart request';

export const FILE_TOO_LARGE_MESSAGE = 'File exceeds maximum allowed size';

export const FIELD_TOO_LARGE_MESSAGE = 'Field exceeds maximum allowed size';

export const MIME_NOT_ALLOWED_MESSAGE = 'File mime type is not allowed';

export const MISSING_BOUNDARY_MESSAGE = 'Missing boundary in content-type header';
