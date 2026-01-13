import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { ChangelogEntry, ChangelogConfig, ChangeItem, ChangeType, ReleaseNotes } from './types';
import { createLogger } from '../utils/logger';

const logger = createLogger('changelog');

const DEFAULT_CONFIG: ChangelogConfig = {
  filePath: './CHANGELOG.md',
  format: 'markdown',
  includeUnreleased: true,
};

export function createChangelogManager(config: Partial<ChangelogConfig> = {}) {
  const cfg: ChangelogConfig = { ...DEFAULT_CONFIG, ...config };
  const entries: ChangelogEntry[] = [];
  let unreleasedChanges: ChangeItem[] = [];

  function load(): void {
    const filePath = resolve(process.cwd(), cfg.filePath);
    
    if (!existsSync(filePath)) {
      logger.info('No changelog file found, starting fresh');
      return;
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      parseMarkdown(content);
      logger.info('Changelog loaded', { entries: entries.length });
    } catch (error) {
      logger.error('Failed to load changelog', error as Error);
    }
  }

  function parseMarkdown(content: string): void {
    const versionRegex = /## \[(\d+\.\d+\.\d+(?:-[\w.]+)?)\](?: - (\d{4}-\d{2}-\d{2}))?/g;
    const sections = content.split(versionRegex);

    for (let i = 1; i < sections.length; i += 3) {
      const version = sections[i];
      const dateStr = sections[i + 1];
      const changesSection = sections[i + 2];

      if (version && changesSection) {
        const entry: ChangelogEntry = {
          version,
          date: dateStr ? new Date(dateStr) : new Date(),
          changes: parseChangesSection(changesSection),
        };
        entries.push(entry);
      }
    }
  }

  function parseChangesSection(section: string): ChangeItem[] {
    const items: ChangeItem[] = [];
    const lines = section.split('\n');
    let currentType: ChangeType | null = null;

    for (const line of lines) {
      const typeMatch = line.match(/^### (Added|Changed|Deprecated|Removed|Fixed|Security)/i);
      if (typeMatch) {
        currentType = typeMatch[1].toLowerCase() as ChangeType;
        continue;
      }

      const itemMatch = line.match(/^- (.+)/);
      if (itemMatch && currentType) {
        items.push({
          type: currentType,
          description: itemMatch[1].trim(),
        });
      }
    }

    return items;
  }

  function save(): void {
    const filePath = resolve(process.cwd(), cfg.filePath);
    const content = generateMarkdown();
    
    writeFileSync(filePath, content, 'utf-8');
    logger.info('Changelog saved', { path: filePath });
  }

  function generateMarkdown(): string {
    let content = '# Changelog\n\n';
    content += 'All notable changes to this project will be documented in this file.\n\n';
    content += 'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\n';
    content += 'and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n';

    if (cfg.includeUnreleased && unreleasedChanges.length > 0) {
      content += '## [Unreleased]\n\n';
      content += formatChanges(unreleasedChanges);
      content += '\n';
    }

    for (const entry of entries) {
      const dateStr = entry.date.toISOString().split('T')[0];
      content += `## [${entry.version}] - ${dateStr}\n\n`;
      content += formatChanges(entry.changes);
      
      if (entry.breaking && entry.breaking.length > 0) {
        content += '### BREAKING CHANGES\n\n';
        for (const item of entry.breaking) {
          content += `- ${item.description}\n`;
        }
        content += '\n';
      }
      
      content += '\n';
    }

    return content;
  }

  function formatChanges(changes: ChangeItem[]): string {
    const grouped = groupByType(changes);
    let content = '';

    const typeOrder: ChangeType[] = ['added', 'changed', 'deprecated', 'removed', 'fixed', 'security'];

    for (const type of typeOrder) {
      const items = grouped[type];
      if (items && items.length > 0) {
        content += `### ${capitalize(type)}\n\n`;
        for (const item of items) {
          let line = `- ${item.description}`;
          if (item.scope) line = `- **${item.scope}:** ${item.description}`;
          if (item.issue) line += ` (#${item.issue})`;
          content += line + '\n';
        }
        content += '\n';
      }
    }

    return content;
  }

  function groupByType(changes: ChangeItem[]): Record<ChangeType, ChangeItem[]> {
    const grouped: Record<ChangeType, ChangeItem[]> = {
      added: [],
      changed: [],
      deprecated: [],
      removed: [],
      fixed: [],
      security: [],
    };

    for (const change of changes) {
      grouped[change.type].push(change);
    }

    return grouped;
  }

  function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return {
    load,
    save,

    addChange(type: ChangeType, description: string, options?: { scope?: string; issue?: string }): void {
      unreleasedChanges.push({
        type,
        description,
        scope: options?.scope,
        issue: options?.issue,
      });
    },

    release(version: string): ChangelogEntry {
      const entry: ChangelogEntry = {
        version,
        date: new Date(),
        changes: [...unreleasedChanges],
      };

      entries.unshift(entry);
      unreleasedChanges = [];
      save();

      logger.info(`Released version ${version}`);
      return entry;
    },

    getEntries(): ChangelogEntry[] {
      return [...entries];
    },

    getUnreleased(): ChangeItem[] {
      return [...unreleasedChanges];
    },

    getLatestVersion(): string | null {
      return entries[0]?.version ?? null;
    },

    getReleaseNotes(version: string): ReleaseNotes | null {
      const entry = entries.find((e) => e.version === version);
      if (!entry) return null;

      const grouped = groupByType(entry.changes);

      return {
        version: entry.version,
        date: entry.date,
        added: grouped.added.map((i) => i.description),
        changed: grouped.changed.map((i) => i.description),
        deprecated: grouped.deprecated.map((i) => i.description),
        removed: grouped.removed.map((i) => i.description),
        fixed: grouped.fixed.map((i) => i.description),
        security: grouped.security.map((i) => i.description),
        breaking: entry.breaking?.map((i) => i.description) ?? [],
      };
    },
  };
}

export function generateChangelog(entries: ChangelogEntry[], config?: Partial<ChangelogConfig>): string {
  const manager = createChangelogManager(config);
  
  for (const entry of entries.reverse()) {
    for (const change of entry.changes) {
      manager.addChange(change.type, change.description, {
        scope: change.scope,
        issue: change.issue,
      });
    }
    manager.release(entry.version);
  }

  return '';
}

export class ChangelogManager {
  private manager: ReturnType<typeof createChangelogManager>;

  constructor(config?: Partial<ChangelogConfig>) {
    this.manager = createChangelogManager(config);
  }

  load = () => this.manager.load();
  save = () => this.manager.save();
  addChange = (...args: Parameters<typeof this.manager.addChange>) => this.manager.addChange(...args);
  release = (version: string) => this.manager.release(version);
  getEntries = () => this.manager.getEntries();
  getUnreleased = () => this.manager.getUnreleased();
  getLatestVersion = () => this.manager.getLatestVersion();
  getReleaseNotes = (version: string) => this.manager.getReleaseNotes(version);
}

