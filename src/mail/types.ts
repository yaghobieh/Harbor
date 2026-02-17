export interface SmtpConfig {
  /** SMTP host (e.g. 'smtp.gmail.com') */
  host: string;
  /** SMTP port (default: 587 for TLS, 465 for SSL) */
  port: number;
  /** Use TLS/STARTTLS (default: true) */
  secure: boolean;
  /** Authentication credentials */
  auth: SmtpAuth;
  /** Connection timeout in ms (default: 10000) */
  timeout?: number;
  /** Custom TLS options */
  tls?: {
    rejectUnauthorized?: boolean;
  };
}

export interface SmtpAuth {
  /** SMTP username (usually email address) */
  user: string;
  /** SMTP password or app-specific password */
  pass: string;
}

export interface MailAddress {
  /** Display name */
  name?: string;
  /** Email address */
  email: string;
}

export interface MailAttachment {
  /** Filename */
  filename: string;
  /** File content as Buffer or base64 string */
  content: Buffer | string;
  /** MIME content type (default: 'application/octet-stream') */
  contentType?: string;
  /** Content encoding (default: 'base64') */
  encoding?: 'base64' | 'utf-8';
}

export interface MailOptions {
  /** Sender address */
  from: string | MailAddress;
  /** Recipient address(es) */
  to: string | MailAddress | Array<string | MailAddress>;
  /** CC address(es) */
  cc?: string | MailAddress | Array<string | MailAddress>;
  /** BCC address(es) */
  bcc?: string | MailAddress | Array<string | MailAddress>;
  /** Email subject */
  subject: string;
  /** Plain text body */
  text?: string;
  /** HTML body */
  html?: string;
  /** Reply-to address */
  replyTo?: string | MailAddress;
  /** File attachments */
  attachments?: MailAttachment[];
  /** Custom headers */
  headers?: Record<string, string>;
  /** Priority: 'high' | 'normal' | 'low' */
  priority?: MailPriority;
}

export type MailPriority = 'high' | 'normal' | 'low';

export interface MailResult {
  /** Whether the email was sent successfully */
  success: boolean;
  /** SMTP response message */
  messageId: string;
  /** Recipients that accepted the email */
  accepted: string[];
  /** Recipients that rejected the email */
  rejected: string[];
  /** SMTP response code */
  response: string;
}

export interface MailTemplate {
  /** Template name/identifier */
  name: string;
  /** Subject template (supports {{variable}} placeholders) */
  subject: string;
  /** HTML template (supports {{variable}} placeholders) */
  html: string;
  /** Plain text template (supports {{variable}} placeholders) */
  text?: string;
}

export type MailProvider = 'gmail' | 'outlook' | 'sendgrid' | 'ses' | 'custom';

export interface MailerOptions {
  /** SMTP transport configuration */
  transport: SmtpConfig;
  /** Default 'from' address for all emails */
  defaultFrom?: string | MailAddress;
  /** Pre-registered templates */
  templates?: MailTemplate[];
}
