export const CONFIG_FILE_NAME = 'harbor.config.json';

export const CONFIG_SEARCH_PATHS = [
  './harbor.config.json',
  './config/harbor.config.json',
  './.harbor/config.json',
] as const;

export const ENV_PREFIX = 'HARBOR_';

export const ENV_KEYS = {
  PORT: 'HARBOR_PORT',
  HOST: 'HARBOR_HOST',
  LOG_LEVEL: 'HARBOR_LOG_LEVEL',
  CONFIG_PATH: 'HARBOR_CONFIG_PATH',
  NODE_ENV: 'NODE_ENV',
} as const;

