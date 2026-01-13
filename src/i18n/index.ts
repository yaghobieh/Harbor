import { en } from './locales/en';
import { he } from './locales/he';

export type Locale = 'en' | 'he';

export type TranslationKey = keyof typeof en;

export interface TranslationParams {
  [key: string]: string | number | boolean | undefined;
}

const locales: Record<Locale, Record<string, string>> = {
  en,
  he,
};

let currentLocale: Locale = 'en';

/**
 * Set the current locale
 */
export function setLocale(locale: Locale): void {
  if (!locales[locale]) {
    console.warn(`Locale "${locale}" not found, falling back to "en"`);
    currentLocale = 'en';
    return;
  }
  currentLocale = locale;
}

/**
 * Get the current locale
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Get all available locales
 */
export function getAvailableLocales(): Locale[] {
  return Object.keys(locales) as Locale[];
}

/**
 * Translate a key with optional parameters
 */
export function t(key: string, params?: TranslationParams): string {
  const translations = locales[currentLocale] ?? locales.en;
  let text = translations[key] ?? locales.en[key] ?? key;

  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(value ?? ''));
    }
  }

  return text;
}

/**
 * Translate a key for a specific locale
 */
export function tLocale(locale: Locale, key: string, params?: TranslationParams): string {
  const translations = locales[locale] ?? locales.en;
  let text = translations[key] ?? locales.en[key] ?? key;

  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(value ?? ''));
    }
  }

  return text;
}

/**
 * Add or update translations for a locale
 */
export function addTranslations(locale: Locale, translations: Record<string, string>): void {
  if (!locales[locale]) {
    locales[locale] = {};
  }
  Object.assign(locales[locale], translations);
}

/**
 * Register a new locale
 */
export function registerLocale(locale: string, translations: Record<string, string>): void {
  locales[locale as Locale] = translations;
}

export { en, he };

