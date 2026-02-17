import * as net from 'node:net';
import * as tls from 'node:tls';
import { createLogger } from '../utils/logger';
import type {
  SmtpConfig,
  MailOptions,
  MailResult,
  MailAddress,
  MailAttachment,
} from './types';
import {
  CRLF,
  SMTP_CODES,
  PRIORITY_HEADERS,
  MIME_BOUNDARY_PREFIX,
  CONTENT_TYPE_HTML,
  CONTENT_TYPE_TEXT,
  DEFAULT_ATTACHMENT_TYPE,
  DEFAULT_SMTP_TIMEOUT,
} from './constants';

const logger = createLogger('mail:smtp');

type SmtpSocket = net.Socket | tls.TLSSocket;

export class SmtpTransport {
  private readonly config: SmtpConfig;

  constructor(config: SmtpConfig) {
    this.config = config;
  }

  /** Send an email via SMTP */
  async send(options: MailOptions): Promise<MailResult> {
    const from = this.formatAddress(options.from);
    const to = this.normalizeRecipients(options.to);
    const cc = options.cc ? this.normalizeRecipients(options.cc) : [];
    const bcc = options.bcc ? this.normalizeRecipients(options.bcc) : [];
    const allRecipients = [...to, ...cc, ...bcc];

    let socket: SmtpSocket | null = null;
    const accepted: string[] = [];
    const rejected: string[] = [];

    try {
      socket = await this.connect();

      // Read greeting
      await this.readResponse(socket);

      // EHLO
      await this.command(socket, `EHLO ${this.config.host}`);

      // STARTTLS for non-secure connections on port 587
      if (!this.config.secure && this.config.port !== 465) {
        try {
          await this.command(socket, 'STARTTLS');
          socket = await this.upgradeToTls(socket);
          await this.command(socket, `EHLO ${this.config.host}`);
        } catch {
          logger.debug('STARTTLS not supported, continuing without TLS');
        }
      }

      // AUTH LOGIN
      await this.authenticate(socket);

      // MAIL FROM
      await this.command(socket, `MAIL FROM:<${this.extractEmail(from)}>`);

      // RCPT TO
      for (const recipient of allRecipients) {
        const email = this.extractEmail(recipient);
        try {
          await this.command(socket, `RCPT TO:<${email}>`);
          accepted.push(email);
        } catch {
          rejected.push(email);
          logger.warn(`Recipient rejected: ${email}`);
        }
      }

      if (accepted.length === 0) {
        throw new Error('All recipients were rejected');
      }

      // DATA
      await this.command(socket, 'DATA', SMTP_CODES.START_INPUT);

      const message = this.buildMessage(options, from, to, cc);
      const messageId = this.generateMessageId();
      const fullMessage = `Message-ID: <${messageId}>${CRLF}${message}`;

      await this.sendData(socket, fullMessage);

      // End data with CRLF.CRLF
      const response = await this.command(socket, `.`);

      // QUIT
      try {
        await this.command(socket, 'QUIT', SMTP_CODES.CLOSING);
      } catch {
        // QUIT failure is non-critical
      }

      logger.info(`Email sent to ${accepted.join(', ')}`);

      return {
        success: true,
        messageId,
        accepted,
        rejected,
        response,
      };
    } catch (err) {
      const error = err as Error;
      logger.error(`Failed to send email: ${error.message}`);
      throw error;
    } finally {
      if (socket && !socket.destroyed) {
        socket.destroy();
      }
    }
  }

  // ── Connection ────────────────────────────────────────────────────────

  private connect(): Promise<SmtpSocket> {
    const timeout = this.config.timeout ?? DEFAULT_SMTP_TIMEOUT;

    return new Promise((resolve, reject) => {
      const onError = (err: Error) => reject(err);
      const onTimeout = () => reject(new Error('SMTP connection timeout'));

      if (this.config.secure) {
        const socket = tls.connect(
          {
            host: this.config.host,
            port: this.config.port,
            rejectUnauthorized: this.config.tls?.rejectUnauthorized ?? true,
          },
          () => {
            socket.removeListener('error', onError);
            resolve(socket);
          },
        );
        socket.setTimeout(timeout);
        socket.once('error', onError);
        socket.once('timeout', onTimeout);
      } else {
        const socket = net.createConnection(
          { host: this.config.host, port: this.config.port },
          () => {
            socket.removeListener('error', onError);
            resolve(socket);
          },
        );
        socket.setTimeout(timeout);
        socket.once('error', onError);
        socket.once('timeout', onTimeout);
      }
    });
  }

  private upgradeToTls(socket: net.Socket): Promise<tls.TLSSocket> {
    return new Promise((resolve, reject) => {
      const tlsSocket = tls.connect(
        {
          socket,
          host: this.config.host,
          rejectUnauthorized: this.config.tls?.rejectUnauthorized ?? true,
        },
        () => resolve(tlsSocket),
      );
      tlsSocket.once('error', reject);
    });
  }

  // ── SMTP Protocol ─────────────────────────────────────────────────────

  private async authenticate(socket: SmtpSocket): Promise<void> {
    const { user, pass } = this.config.auth;

    // Try AUTH LOGIN
    await this.command(socket, 'AUTH LOGIN', SMTP_CODES.AUTH_CONTINUE);
    await this.command(
      socket,
      Buffer.from(user).toString('base64'),
      SMTP_CODES.AUTH_CONTINUE,
    );
    await this.command(
      socket,
      Buffer.from(pass).toString('base64'),
      SMTP_CODES.AUTH_SUCCESS,
    );

    logger.debug('SMTP authentication successful');
  }

  private command(
    socket: SmtpSocket,
    cmd: string,
    expectedCode?: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      socket.write(`${cmd}${CRLF}`, () => {
        this.readResponse(socket)
          .then((response) => {
            const code = parseInt(response.substring(0, 3), 10);
            const expected = expectedCode ?? SMTP_CODES.OK;

            if (code !== expected) {
              reject(new Error(`SMTP error ${code}: ${response}`));
            } else {
              resolve(response);
            }
          })
          .catch(reject);
      });
    });
  }

  private readResponse(socket: SmtpSocket): Promise<string> {
    return new Promise((resolve, reject) => {
      const onData = (data: Buffer) => {
        socket.removeListener('data', onData);
        socket.removeListener('error', onError);
        resolve(data.toString('utf-8').trim());
      };

      const onError = (err: Error) => {
        socket.removeListener('data', onData);
        reject(err);
      };

      socket.once('data', onData);
      socket.once('error', onError);
    });
  }

  private sendData(socket: SmtpSocket, data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      socket.write(data + CRLF, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // ── Message Building ──────────────────────────────────────────────────

  private buildMessage(
    options: MailOptions,
    from: string,
    to: string[],
    cc: string[],
  ): string {
    const boundary = `${MIME_BOUNDARY_PREFIX}${Date.now().toString(36)}`;
    const hasAttachments = options.attachments && options.attachments.length > 0;
    const lines: string[] = [];

    // Headers
    lines.push(`From: ${from}`);
    lines.push(`To: ${to.join(', ')}`);
    if (cc.length > 0) lines.push(`Cc: ${cc.join(', ')}`);
    lines.push(`Subject: ${this.encodeSubject(options.subject)}`);
    lines.push(`Date: ${new Date().toUTCString()}`);
    lines.push('MIME-Version: 1.0');

    if (options.replyTo) {
      lines.push(`Reply-To: ${this.formatAddress(options.replyTo)}`);
    }

    if (options.priority && options.priority !== 'normal') {
      lines.push(`X-Priority: ${PRIORITY_HEADERS[options.priority]}`);
    }

    // Custom headers
    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        lines.push(`${key}: ${value}`);
      }
    }

    if (hasAttachments) {
      lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
      lines.push('');

      // Text/HTML part
      const textBoundary = `${boundary}-alt`;
      lines.push(`--${boundary}`);
      lines.push(`Content-Type: multipart/alternative; boundary="${textBoundary}"`);
      lines.push('');

      if (options.text) {
        lines.push(`--${textBoundary}`);
        lines.push(`Content-Type: ${CONTENT_TYPE_TEXT}`);
        lines.push('Content-Transfer-Encoding: quoted-printable');
        lines.push('');
        lines.push(options.text);
      }

      if (options.html) {
        lines.push(`--${textBoundary}`);
        lines.push(`Content-Type: ${CONTENT_TYPE_HTML}`);
        lines.push('Content-Transfer-Encoding: quoted-printable');
        lines.push('');
        lines.push(options.html);
      }

      lines.push(`--${textBoundary}--`);

      // Attachments
      for (const attachment of options.attachments!) {
        lines.push(`--${boundary}`);
        lines.push(...this.buildAttachment(attachment));
      }

      lines.push(`--${boundary}--`);
    } else if (options.html && options.text) {
      const altBoundary = `${MIME_BOUNDARY_PREFIX}alt-${Date.now().toString(36)}`;
      lines.push(`Content-Type: multipart/alternative; boundary="${altBoundary}"`);
      lines.push('');

      lines.push(`--${altBoundary}`);
      lines.push(`Content-Type: ${CONTENT_TYPE_TEXT}`);
      lines.push('');
      lines.push(options.text);

      lines.push(`--${altBoundary}`);
      lines.push(`Content-Type: ${CONTENT_TYPE_HTML}`);
      lines.push('');
      lines.push(options.html);

      lines.push(`--${altBoundary}--`);
    } else if (options.html) {
      lines.push(`Content-Type: ${CONTENT_TYPE_HTML}`);
      lines.push('');
      lines.push(options.html);
    } else {
      lines.push(`Content-Type: ${CONTENT_TYPE_TEXT}`);
      lines.push('');
      lines.push(options.text ?? '');
    }

    return lines.join(CRLF);
  }

  private buildAttachment(attachment: MailAttachment): string[] {
    const contentType = attachment.contentType ?? DEFAULT_ATTACHMENT_TYPE;
    const content =
      typeof attachment.content === 'string'
        ? attachment.content
        : attachment.content.toString('base64');

    return [
      `Content-Type: ${contentType}; name="${attachment.filename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      '',
      content,
    ];
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private formatAddress(addr: string | MailAddress): string {
    if (typeof addr === 'string') return addr;
    return addr.name ? `"${addr.name}" <${addr.email}>` : addr.email;
  }

  private extractEmail(addr: string): string {
    const match = addr.match(/<(.+)>/);
    return match ? match[1] : addr;
  }

  private normalizeRecipients(
    recipients: string | MailAddress | Array<string | MailAddress>,
  ): string[] {
    const list = Array.isArray(recipients) ? recipients : [recipients];
    return list.map((r) => this.formatAddress(r));
  }

  private encodeSubject(subject: string): string {
    // Check if subject needs encoding (non-ASCII characters)
    if (/^[\x20-\x7E]*$/.test(subject)) return subject;
    return `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;
  }

  private generateMessageId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}.${random}@harbor`;
  }
}
