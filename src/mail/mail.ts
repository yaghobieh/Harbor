import { createLogger } from '../utils/logger';
import { SmtpTransport } from './transport';
import {
  registerTemplate,
  registerTemplates,
  renderNamedTemplate,
} from './template';
import type {
  MailerOptions,
  MailOptions,
  MailResult,
  MailAddress,
  SmtpConfig,
  SmtpAuth,
  MailProvider,
} from './types';
import { SMTP_PROVIDERS } from './constants';

const logger = createLogger('mail');

export class Mailer {
  private readonly transport: SmtpTransport;
  private readonly defaultFrom: string | MailAddress | undefined;

  constructor(options: MailerOptions) {
    this.transport = new SmtpTransport(options.transport);
    this.defaultFrom = options.defaultFrom;

    if (options.templates) {
      registerTemplates(options.templates);
    }

    logger.info('Mailer initialized', { host: options.transport.host });
  }

  /** Send an email */
  async send(options: MailOptions): Promise<MailResult> {
    const mailOptions: MailOptions = {
      ...options,
      from: options.from ?? this.defaultFrom ?? '',
    };

    if (!mailOptions.from) {
      throw new Error('No "from" address provided. Set defaultFrom in MailerOptions or pass it in MailOptions.');
    }

    return this.transport.send(mailOptions);
  }

  /** Send an email using a registered template */
  async sendTemplate(
    templateName: string,
    variables: Record<string, string | number | boolean>,
    options: Omit<MailOptions, 'subject' | 'html' | 'text'>,
  ): Promise<MailResult> {
    const rendered = renderNamedTemplate(templateName, variables);

    return this.send({
      ...options,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
  }

  /** Register a template for later use with sendTemplate() */
  addTemplate = registerTemplate;
}

/** Create a mailer with full options */
export function createMailer(options: MailerOptions): Mailer {
  return new Mailer(options);
}

/** Create a mailer with a pre-configured provider (Gmail, Outlook, etc.) */
export function createMailerFromProvider(
  provider: MailProvider,
  auth: SmtpAuth,
  defaultFrom?: string | MailAddress,
): Mailer {
  const providerConfig = SMTP_PROVIDERS[provider];

  if (!providerConfig) {
    throw new Error(`Unknown mail provider: ${provider}. Use: gmail, outlook, sendgrid, ses, custom`);
  }

  const transport: SmtpConfig = {
    ...providerConfig,
    auth,
  };

  return new Mailer({ transport, defaultFrom });
}
