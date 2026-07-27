export { Mailer, createMailer, createMailerFromProvider } from './mail';
export { SmtpTransport } from './transport';
export {
  registerTemplate,
  registerTemplates,
  getTemplate,
  removeTemplate,
  listTemplates,
  renderTemplate,
  renderNamedTemplate,
  escapeHtml,
} from './template';

export type {
  MailOptions,
  MailResult,
  MailAddress,
  MailAttachment,
  MailTemplate,
  MailPriority,
  MailerOptions,
  MailProvider,
  SmtpConfig,
  SmtpAuth,
} from './types';
