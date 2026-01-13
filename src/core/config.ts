import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import type { HarborConfig } from '../types';
import { CONFIG_SEARCH_PATHS, ENV_KEYS } from '../constants';
import { DEFAULT_CONFIG } from '../constants/defaults.const';
import { createLogger } from '../utils/logger';

const logger = createLogger('config');

export function loadConfig(configPath?: string): HarborConfig {
  const path = findConfigPath(configPath);
  
  if (!path) {
    logger.info('No config file found, using defaults');
    return applyEnvOverrides(DEFAULT_CONFIG);
  }

  try {
    const fileContent = readFileSync(path, 'utf-8');
    const userConfig = JSON.parse(fileContent) as Partial<HarborConfig>;
    const mergedConfig = deepMerge(DEFAULT_CONFIG, userConfig);
    
    logger.info('Config loaded', { path });
    return applyEnvOverrides(mergedConfig);
  } catch (error) {
    logger.error('Failed to load config', error as Error);
    return applyEnvOverrides(DEFAULT_CONFIG);
  }
}

export function defineConfig(config: Partial<HarborConfig>): HarborConfig {
  return deepMerge(DEFAULT_CONFIG, config);
}

function findConfigPath(customPath?: string): string | null {
  if (customPath) {
    const resolved = resolve(process.cwd(), customPath);
    if (existsSync(resolved)) {
      return resolved;
    }
    return null;
  }

  const envPath = process.env[ENV_KEYS.CONFIG_PATH];
  if (envPath) {
    const resolved = resolve(process.cwd(), envPath);
    if (existsSync(resolved)) {
      return resolved;
    }
  }

  for (const searchPath of CONFIG_SEARCH_PATHS) {
    const resolved = resolve(process.cwd(), searchPath);
    if (existsSync(resolved)) {
      return resolved;
    }
  }

  return null;
}

function applyEnvOverrides(config: HarborConfig): HarborConfig {
  const envPort = process.env[ENV_KEYS.PORT];
  const envHost = process.env[ENV_KEYS.HOST];
  const envLogLevel = process.env[ENV_KEYS.LOG_LEVEL];

  if (envPort) {
    config.server.port = parseInt(envPort, 10);
  }

  if (envHost) {
    config.server.host = envHost;
  }

  if (envLogLevel) {
    config.logger.level = envLogLevel as HarborConfig['logger']['level'];
  }

  return config;
}

function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        ) as T[Extract<keyof T, string>];
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

export function getConfigValue<T>(config: HarborConfig, path: string): T | undefined {
  const keys = path.split('.');
  let current: unknown = config;

  for (const key of keys) {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current as T;
}

