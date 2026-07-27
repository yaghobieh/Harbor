import type { MailTemplate } from './types';

/** Template placeholder pattern: {{variableName}} */
const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g;

/** Registered templates store */
const templates = new Map<string, MailTemplate>();

/** Register a template for later use */
export function registerTemplate(template: MailTemplate): void {
  templates.set(template.name, template);
}

/** Register multiple templates */
export function registerTemplates(list: MailTemplate[]): void {
  for (const template of list) {
    templates.set(template.name, template);
  }
}

/** Get a registered template by name */
export function getTemplate(name: string): MailTemplate | undefined {
  return templates.get(name);
}

/** Remove a registered template */
export function removeTemplate(name: string): boolean {
  return templates.delete(name);
}

/** List all registered template names */
export function listTemplates(): string[] {
  return Array.from(templates.keys());
}

/**
 * Render a template string with the given variables.
 * Replaces {{variableName}} placeholders with corresponding values.
 */
export function renderTemplate(
  template: string,
  variables: Record<string, string | number | boolean>,
): string {
  return template.replace(PLACEHOLDER_PATTERN, (_, key: string) => {
    const value = variables[key];
    return value !== undefined ? String(value) : `{{${key}}}`;
  });
}

/**
 * Render a named template that was previously registered.
 * Returns rendered { subject, html, text }.
 */
export function renderNamedTemplate(
  name: string,
  variables: Record<string, string | number | boolean>,
): { subject: string; html: string; text?: string } {
  const template = templates.get(name);

  if (!template) {
    throw new Error(`Mail template "${name}" not found. Register it first with registerTemplate().`);
  }

  return {
    subject: renderTemplate(template.subject, variables),
    html: renderTemplate(template.html, variables),
    text: template.text ? renderTemplate(template.text, variables) : undefined,
  };
}

/**
 * Escape HTML special characters in a string.
 * Useful for preventing XSS in dynamic email content.
 */
export function escapeHtml(str: string): string {
  const HTML_ESCAPE_MAP: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return str.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char);
}
