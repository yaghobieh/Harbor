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

export const AWS_ALGORITHM = 'AWS4-HMAC-SHA256';

export const AWS_REQUEST_TYPE = 'aws4_request';

export const AWS_SERVICE_S3 = 's3';

export const UNSIGNED_PAYLOAD = 'UNSIGNED-PAYLOAD';

export const EMPTY_SHA256 =
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

export const DEFAULT_S3_REGION = 'us-east-1';

export const DEFAULT_SIGNED_URL_EXPIRES_SECONDS = 3600;

export const S3_TEMP_FILE_PREFIX = 'harbor-s3-';

export const HTTP_METHOD_PUT = 'PUT';

export const HTTP_METHOD_DELETE = 'DELETE';

export const HTTP_METHOD_HEAD = 'HEAD';

export const HTTP_METHOD_GET = 'GET';

export const HTTPS_PROTOCOL = 'https:';
