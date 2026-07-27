import { createHmac, createHash } from 'crypto';
import type { S3CompatibleCredentials } from './upload.types';
import {
  AWS_ALGORITHM,
  AWS_REQUEST_TYPE,
  EMPTY_SHA256,
  UNSIGNED_PAYLOAD,
} from './upload.const';

export interface SignRequestInput {
  method: string;
  url: URL;
  headers: Record<string, string>;
  credentials: S3CompatibleCredentials;
  region: string;
  service?: string;
  payloadHash?: string;
  amzDate?: string;
}

export interface SignedRequest {
  headers: Record<string, string>;
  amzDate: string;
  authorization: string;
}

export function sha256Hex(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

export function hmacSha256(key: Buffer | string, value: string): Buffer {
  return createHmac('sha256', key).update(value, 'utf8').digest();
}

export function toAmzDate(date = new Date()): string {
  return date
    .toISOString()
    .replace(/[:-]|\.\d{3}/g, '');
}

export function toCredentialScope(amzDate: string, region: string, service: string): string {
  const dateStamp = amzDate.slice(0, 8);
  return `${dateStamp}/${region}/${service}/${AWS_REQUEST_TYPE}`;
}

export function getSigningKey(
  secretAccessKey: string,
  amzDate: string,
  region: string,
  service: string
): Buffer {
  const dateStamp = amzDate.slice(0, 8);
  const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  return hmacSha256(kService, AWS_REQUEST_TYPE);
}

export function signAwsRequest(input: SignRequestInput): SignedRequest {
  const service = input.service ?? 's3';
  const amzDate = input.amzDate ?? toAmzDate();
  const payloadHash = input.payloadHash ?? UNSIGNED_PAYLOAD;
  const headers: Record<string, string> = {
    ...normalizeHeaders(input.headers),
    host: input.url.host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
  };

  if (input.credentials.sessionToken) {
    headers['x-amz-security-token'] = input.credentials.sessionToken;
  }

  const signedHeaderNames = Object.keys(headers).sort();
  const signedHeaders = signedHeaderNames.join(';');
  const canonicalHeaders = signedHeaderNames
    .map((name) => `${name}:${headers[name]}\n`)
    .join('');
  const canonicalQuery = canonicalizeQuery(input.url.searchParams);
  const canonicalRequest = [
    input.method.toUpperCase(),
    input.url.pathname || '/',
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = toCredentialScope(amzDate, input.region, service);
  const stringToSign = [
    AWS_ALGORITHM,
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const signingKey = getSigningKey(
    input.credentials.secretAccessKey,
    amzDate,
    input.region,
    service
  );
  const signature = createHmac('sha256', signingKey)
    .update(stringToSign, 'utf8')
    .digest('hex');

  const authorization = `${AWS_ALGORITHM} Credential=${input.credentials.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    headers: {
      ...headers,
      authorization,
    },
    amzDate,
    authorization,
  };
}

export function createPresignedUrl(input: {
  method: string;
  url: URL;
  credentials: S3CompatibleCredentials;
  region: string;
  expiresInSeconds: number;
  service?: string;
}): string {
  const service = input.service ?? 's3';
  const amzDate = toAmzDate();
  const credentialScope = toCredentialScope(amzDate, input.region, service);
  const credential = `${input.credentials.accessKeyId}/${credentialScope}`;
  const params = new URLSearchParams(input.url.searchParams);
  params.set('X-Amz-Algorithm', AWS_ALGORITHM);
  params.set('X-Amz-Credential', credential);
  params.set('X-Amz-Date', amzDate);
  params.set('X-Amz-Expires', String(input.expiresInSeconds));
  params.set('X-Amz-SignedHeaders', 'host');
  if (input.credentials.sessionToken) {
    params.set('X-Amz-Security-Token', input.credentials.sessionToken);
  }

  const canonicalQuery = canonicalizeQuery(params);
  const canonicalRequest = [
    input.method.toUpperCase(),
    input.url.pathname || '/',
    canonicalQuery,
    `host:${input.url.host}\n`,
    'host',
    UNSIGNED_PAYLOAD,
  ].join('\n');

  const stringToSign = [
    AWS_ALGORITHM,
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');

  const signingKey = getSigningKey(
    input.credentials.secretAccessKey,
    amzDate,
    input.region,
    service
  );
  const signature = createHmac('sha256', signingKey)
    .update(stringToSign, 'utf8')
    .digest('hex');

  params.set('X-Amz-Signature', signature);
  return `${input.url.origin}${input.url.pathname}?${canonicalizeQuery(params)}`;
}

export function hashEmptyPayload(): string {
  return EMPTY_SHA256;
}

function normalizeHeaders(headers: Record<string, string>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = value.trim().replace(/\s+/g, ' ');
  }
  return normalized;
}

function canonicalizeQuery(params: URLSearchParams): string {
  const pairs: Array<[string, string]> = [];
  params.forEach((value, key) => {
    pairs.push([uriEncode(key), uriEncode(value)]);
  });
  pairs.sort((a, b) => {
    if (a[0] === b[0]) return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
    return a[0] < b[0] ? -1 : 1;
  });
  return pairs.map(([key, value]) => `${key}=${value}`).join('&');
}

function uriEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}
