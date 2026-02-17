import type { JobPriority } from './types';

/** Default number of concurrent workers */
export const DEFAULT_CONCURRENCY = 1;

/** Default maximum retry attempts */
export const DEFAULT_MAX_RETRIES = 3;

/** Default backoff multiplier for retries */
export const DEFAULT_BACKOFF = 2;

/** Default base delay for retry backoff (ms) */
export const DEFAULT_BASE_RETRY_DELAY = 1000;

/** Default max dead letter queue size */
export const DEFAULT_DEAD_LETTER_MAX = 100;

/** Default poll interval for delayed jobs (ms) */
export const DEFAULT_POLL_INTERVAL = 1000;

/** Priority weight mapping — higher = processed first */
export const PRIORITY_WEIGHTS: Record<JobPriority, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
};

/** Job ID prefix */
export const JOB_ID_PREFIX = 'job';

/** Random ID segment length */
export const ID_RANDOM_LENGTH = 9;
