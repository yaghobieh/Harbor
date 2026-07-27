import type { SmtpConfig, MailProvider } from './types';

/** Default connection timeout (ms) */
export const DEFAULT_SMTP_TIMEOUT = 10_000;

/** Default SMTP port for STARTTLS */
export const DEFAULT_SMTP_PORT_TLS = 587;

/** Default SMTP port for SSL */
export const DEFAULT_SMTP_PORT_SSL = 465;

/** Line ending for SMTP protocol */
export const CRLF = '\r\n';

/** Maximum line length per RFC 2821 */
export const MAX_LINE_LENGTH = 998;

/** MIME boundary prefix */
export const MIME_BOUNDARY_PREFIX = '----HarborMail';

/** Default content type for attachments */
export const DEFAULT_ATTACHMENT_TYPE = 'application/octet-stream';

/** Default content type for HTML */
export const CONTENT_TYPE_HTML = 'text/html; charset=utf-8';

/** Default content type for plain text */
export const CONTENT_TYPE_TEXT = 'text/plain; charset=utf-8';

/** SMTP response codes */
export const SMTP_CODES = {
  READY: 220,
  CLOSING: 221,
  AUTH_SUCCESS: 235,
  OK: 250,
  AUTH_CONTINUE: 334,
  START_INPUT: 354,
} as const;

/** Priority header values */
export const PRIORITY_HEADERS: Record<string, string> = {
  high: '1 (Highest)',
  normal: '3 (Normal)',
  low: '5 (Lowest)',
};

/** Pre-configured SMTP providers */
export const SMTP_PROVIDERS: Record<MailProvider, Omit<SmtpConfig, 'auth'>> = {
  gmail: {
    host: 'smtp.gmail.com',
    port: DEFAULT_SMTP_PORT_SSL,
    secure: true,
  },
  outlook: {
    host: 'smtp-mail.outlook.com',
    port: DEFAULT_SMTP_PORT_TLS,
    secure: false,
  },
  sendgrid: {
    host: 'smtp.sendgrid.net',
    port: DEFAULT_SMTP_PORT_TLS,
    secure: false,
  },
  ses: {
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: DEFAULT_SMTP_PORT_TLS,
    secure: false,
  },
  custom: {
    host: 'localhost',
    port: DEFAULT_SMTP_PORT_TLS,
    secure: false,
  },
};
