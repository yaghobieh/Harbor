export interface ApiKeyOptions {
  header?: string;
  query?: string;
  validator: (key: string) => boolean | Promise<boolean | { valid: boolean; data?: unknown }>;
}

