export interface ChangelogEntry {
  version: string;
  date: Date;
  changes: ChangeItem[];
  breaking?: ChangeItem[];
}

export interface ChangeItem {
  type: ChangeType;
  description: string;
  scope?: string;
  issue?: string;
  pr?: string;
}

export type ChangeType = 
  | 'added'
  | 'changed'
  | 'deprecated'
  | 'removed'
  | 'fixed'
  | 'security';

export interface ChangelogConfig {
  filePath: string;
  format: 'markdown' | 'json';
  includeUnreleased: boolean;
  compareUrl?: string;
  issueUrl?: string;
  prUrl?: string;
}

export interface VersionTag {
  version: string;
  commit: string;
  date: Date;
  message?: string;
}

export interface ReleaseNotes {
  version: string;
  date: Date;
  summary?: string;
  added: string[];
  changed: string[];
  deprecated: string[];
  removed: string[];
  fixed: string[];
  security: string[];
  breaking: string[];
}

