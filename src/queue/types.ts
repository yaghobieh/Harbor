export type JobStatus = 'pending' | 'active' | 'completed' | 'failed' | 'delayed' | 'dead';

export type JobPriority = 'low' | 'normal' | 'high' | 'critical';

export interface QueueJob<T = unknown> {
  /** Unique job identifier */
  id: string;
  /** Queue name this job belongs to */
  queue: string;
  /** Job payload data */
  data: T;
  /** Current job status */
  status: JobStatus;
  /** Job priority */
  priority: JobPriority;
  /** Number of attempts made */
  attempts: number;
  /** Maximum retry attempts */
  maxRetries: number;
  /** Delay before processing (ms) */
  delay: number;
  /** Backoff multiplier for retries */
  backoff: number;
  /** Timestamp when job was created */
  createdAt: number;
  /** Timestamp when job started processing */
  startedAt: number | null;
  /** Timestamp when job completed or failed */
  finishedAt: number | null;
  /** Timestamp for next retry attempt */
  nextRetryAt: number | null;
  /** Error message if failed */
  error: string | null;
  /** Processing duration in ms */
  duration: number | null;
  /** Result data if completed */
  result: unknown | null;
}

export interface AddJobOptions {
  /** Job priority (default: 'normal') */
  priority?: JobPriority;
  /** Delay before processing in ms (default: 0) */
  delay?: number;
  /** Max retry attempts (default: 3) */
  maxRetries?: number;
  /** Backoff multiplier for retries (default: 2) */
  backoff?: number;
  /** Unique job ID (auto-generated if not provided) */
  jobId?: string;
}

export interface QueueOptions {
  /** Maximum concurrent workers (default: 1) */
  concurrency?: number;
  /** Default max retries for jobs (default: 3) */
  defaultMaxRetries?: number;
  /** Default backoff multiplier (default: 2) */
  defaultBackoff?: number;
  /** Base delay for retry backoff in ms (default: 1000) */
  baseRetryDelay?: number;
  /** Max jobs in dead letter queue before cleanup (default: 100) */
  deadLetterMax?: number;
  /** Poll interval for delayed jobs in ms (default: 1000) */
  pollInterval?: number;
}

export type JobHandler<T = unknown, R = unknown> = (job: QueueJob<T>) => R | Promise<R>;

export interface QueueEvents<T = unknown> {
  onJobComplete?: (job: QueueJob<T>) => void;
  onJobFailed?: (job: QueueJob<T>, error: Error) => void;
  onJobRetry?: (job: QueueJob<T>, attempt: number) => void;
  onJobDead?: (job: QueueJob<T>) => void;
  onDrained?: () => void;
}

export interface QueueStats {
  pending: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  dead: number;
  total: number;
  processed: number;
  avgDuration: number;
}
