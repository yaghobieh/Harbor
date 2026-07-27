import { createLogger } from '../utils/logger';
import type {
  QueueJob,
  AddJobOptions,
  QueueOptions,
  JobHandler,
  QueueEvents,
  QueueStats,
  JobStatus,
} from './types';
import {
  DEFAULT_CONCURRENCY,
  DEFAULT_MAX_RETRIES,
  DEFAULT_BACKOFF,
  DEFAULT_BASE_RETRY_DELAY,
  DEFAULT_DEAD_LETTER_MAX,
  DEFAULT_POLL_INTERVAL,
  PRIORITY_WEIGHTS,
  JOB_ID_PREFIX,
  ID_RANDOM_LENGTH,
} from './constants';

const logger = createLogger('queue');

export class Queue<T = unknown, R = unknown> {
  private readonly name: string;
  private readonly options: Required<QueueOptions>;
  private readonly events: QueueEvents<T>;

  private pending: QueueJob<T>[] = [];
  private active: Map<string, QueueJob<T>> = new Map();
  private completed: QueueJob<T>[] = [];
  private failed: QueueJob<T>[] = [];
  private delayed: QueueJob<T>[] = [];
  private deadLetter: QueueJob<T>[] = [];

  private handler: JobHandler<T, R> | null = null;
  private running = false;
  private pollTimer: NodeJS.Timeout | null = null;
  private processedCount = 0;
  private totalDuration = 0;

  constructor(
    name: string,
    options: QueueOptions = {},
    events: QueueEvents<T> = {},
  ) {
    this.name = name;
    this.events = events;
    this.options = {
      concurrency: options.concurrency ?? DEFAULT_CONCURRENCY,
      defaultMaxRetries: options.defaultMaxRetries ?? DEFAULT_MAX_RETRIES,
      defaultBackoff: options.defaultBackoff ?? DEFAULT_BACKOFF,
      baseRetryDelay: options.baseRetryDelay ?? DEFAULT_BASE_RETRY_DELAY,
      deadLetterMax: options.deadLetterMax ?? DEFAULT_DEAD_LETTER_MAX,
      pollInterval: options.pollInterval ?? DEFAULT_POLL_INTERVAL,
    };

    logger.info(`Queue "${name}" created`, {
      concurrency: this.options.concurrency,
      maxRetries: this.options.defaultMaxRetries,
    });
  }

  /** Register a job handler/processor */
  process(handler: JobHandler<T, R>): void {
    this.handler = handler;
    logger.info(`Queue "${this.name}" handler registered`);
  }

  /** Add a job to the queue */
  add(data: T, options: AddJobOptions = {}): QueueJob<T> {
    const {
      priority = 'normal',
      delay = 0,
      maxRetries,
      backoff,
      jobId,
    } = options;

    const job: QueueJob<T> = {
      id: jobId ?? this.generateId(),
      queue: this.name,
      data,
      status: delay > 0 ? 'delayed' : 'pending',
      priority,
      attempts: 0,
      maxRetries: maxRetries ?? this.options.defaultMaxRetries,
      delay,
      backoff: backoff ?? this.options.defaultBackoff,
      createdAt: Date.now(),
      startedAt: null,
      finishedAt: null,
      nextRetryAt: null,
      error: null,
      duration: null,
      result: null,
    };

    if (delay > 0) {
      job.nextRetryAt = Date.now() + delay;
      this.delayed.push(job);
      logger.debug(`Job ${job.id} delayed by ${delay}ms`);
    } else {
      this.insertByPriority(job);
      logger.debug(`Job ${job.id} added to queue "${this.name}"`);
    }

    if (this.running) {
      this.tick();
    }

    return job;
  }

  /** Add multiple jobs at once */
  addBulk(items: Array<{ data: T; options?: AddJobOptions }>): QueueJob<T>[] {
    return items.map(({ data, options }) => this.add(data, options));
  }

  /** Start processing jobs */
  start(): void {
    if (this.running) return;

    if (!this.handler) {
      throw new Error(`Queue "${this.name}" has no handler registered. Call .process() first.`);
    }

    this.running = true;

    this.pollTimer = setInterval(() => {
      this.promoteDelayed();
      this.tick();
    }, this.options.pollInterval);

    this.tick();
    logger.info(`Queue "${this.name}" started`);
  }

  /** Stop processing jobs */
  stop(): void {
    this.running = false;

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    logger.info(`Queue "${this.name}" stopped`);
  }

  /** Pause the queue (stop processing but keep jobs) */
  pause(): void {
    this.running = false;

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    logger.info(`Queue "${this.name}" paused`);
  }

  /** Resume processing */
  resume(): void {
    this.start();
  }

  /** Get a job by ID */
  getJob(jobId: string): QueueJob<T> | undefined {
    return (
      this.pending.find((j) => j.id === jobId) ??
      this.active.get(jobId) ??
      this.completed.find((j) => j.id === jobId) ??
      this.failed.find((j) => j.id === jobId) ??
      this.delayed.find((j) => j.id === jobId) ??
      this.deadLetter.find((j) => j.id === jobId)
    );
  }

  /** Remove a pending job */
  remove(jobId: string): boolean {
    const index = this.pending.findIndex((j) => j.id === jobId);
    if (index !== -1) {
      this.pending.splice(index, 1);
      return true;
    }

    const delayedIndex = this.delayed.findIndex((j) => j.id === jobId);
    if (delayedIndex !== -1) {
      this.delayed.splice(delayedIndex, 1);
      return true;
    }

    return false;
  }

  /** Get all jobs with a specific status */
  getJobs(status?: JobStatus): QueueJob<T>[] {
    if (!status) {
      return [
        ...this.pending,
        ...Array.from(this.active.values()),
        ...this.completed,
        ...this.failed,
        ...this.delayed,
        ...this.deadLetter,
      ];
    }

    const statusMap: Record<JobStatus, () => QueueJob<T>[]> = {
      pending: () => this.pending,
      active: () => Array.from(this.active.values()),
      completed: () => this.completed,
      failed: () => this.failed,
      delayed: () => this.delayed,
      dead: () => this.deadLetter,
    };

    return statusMap[status]();
  }

  /** Get queue statistics */
  stats(): QueueStats {
    return {
      pending: this.pending.length,
      active: this.active.size,
      completed: this.completed.length,
      failed: this.failed.length,
      delayed: this.delayed.length,
      dead: this.deadLetter.length,
      total:
        this.pending.length +
        this.active.size +
        this.completed.length +
        this.failed.length +
        this.delayed.length +
        this.deadLetter.length,
      processed: this.processedCount,
      avgDuration: this.processedCount > 0
        ? Math.round(this.totalDuration / this.processedCount)
        : 0,
    };
  }

  /** Clear completed and failed jobs */
  clean(status?: JobStatus): number {
    let cleaned = 0;

    if (!status || status === 'completed') {
      cleaned += this.completed.length;
      this.completed = [];
    }
    if (!status || status === 'failed') {
      cleaned += this.failed.length;
      this.failed = [];
    }
    if (status === 'dead') {
      cleaned += this.deadLetter.length;
      this.deadLetter = [];
    }

    return cleaned;
  }

  /** Retry all failed jobs */
  retryAll(): number {
    let retried = 0;

    const failedJobs = [...this.failed];
    this.failed = [];

    for (const job of failedJobs) {
      job.status = 'pending';
      job.attempts = 0;
      job.error = null;
      job.nextRetryAt = null;
      this.insertByPriority(job);
      retried++;
    }

    if (retried > 0 && this.running) {
      this.tick();
    }

    return retried;
  }

  /** Drain the queue — remove all pending jobs */
  drain(): number {
    const count = this.pending.length + this.delayed.length;
    this.pending = [];
    this.delayed = [];
    return count;
  }

  // ── Internal ──────────────────────────────────────────────────────────

  private tick(): void {
    if (!this.running || !this.handler) return;

    while (
      this.active.size < this.options.concurrency &&
      this.pending.length > 0
    ) {
      const job = this.pending.shift();
      if (job) {
        this.processJob(job);
      }
    }

    if (
      this.pending.length === 0 &&
      this.active.size === 0 &&
      this.delayed.length === 0
    ) {
      this.events.onDrained?.();
    }
  }

  private async processJob(job: QueueJob<T>): Promise<void> {
    if (!this.handler) return;

    job.status = 'active';
    job.startedAt = Date.now();
    job.attempts++;
    this.active.set(job.id, job);

    try {
      const result = await this.handler(job);
      const duration = Date.now() - job.startedAt;

      job.status = 'completed';
      job.finishedAt = Date.now();
      job.duration = duration;
      job.result = result;

      this.active.delete(job.id);
      this.completed.push(job);
      this.processedCount++;
      this.totalDuration += duration;

      logger.debug(`Job ${job.id} completed in ${duration}ms`);
      this.events.onJobComplete?.(job);
    } catch (err) {
      const error = err as Error;
      const duration = Date.now() - (job.startedAt ?? Date.now());

      job.error = error.message;
      job.duration = duration;
      this.active.delete(job.id);

      if (job.attempts < job.maxRetries) {
        const retryDelay =
          this.options.baseRetryDelay * Math.pow(job.backoff, job.attempts - 1);

        job.status = 'delayed';
        job.nextRetryAt = Date.now() + retryDelay;
        this.delayed.push(job);

        logger.warn(
          `Job ${job.id} failed (attempt ${job.attempts}/${job.maxRetries}), retrying in ${retryDelay}ms`,
        );
        this.events.onJobRetry?.(job, job.attempts);
      } else {
        job.status = 'dead';
        job.finishedAt = Date.now();
        this.deadLetter.push(job);
        this.processedCount++;
        this.totalDuration += duration;

        this.trimDeadLetter();

        logger.error(`Job ${job.id} moved to dead letter queue after ${job.maxRetries} attempts`);
        this.events.onJobDead?.(job);
        this.events.onJobFailed?.(job, error);
      }
    }

    this.tick();
  }

  private promoteDelayed(): void {
    const now = Date.now();
    const ready: QueueJob<T>[] = [];
    const stillDelayed: QueueJob<T>[] = [];

    for (const job of this.delayed) {
      if (job.nextRetryAt !== null && job.nextRetryAt <= now) {
        job.status = 'pending';
        job.nextRetryAt = null;
        ready.push(job);
      } else {
        stillDelayed.push(job);
      }
    }

    this.delayed = stillDelayed;

    for (const job of ready) {
      this.insertByPriority(job);
    }

    if (ready.length > 0) {
      logger.debug(`Promoted ${ready.length} delayed jobs to pending`);
    }
  }

  private insertByPriority(job: QueueJob<T>): void {
    const weight = PRIORITY_WEIGHTS[job.priority];
    const insertIndex = this.pending.findIndex(
      (j) => PRIORITY_WEIGHTS[j.priority] < weight,
    );

    if (insertIndex === -1) {
      this.pending.push(job);
    } else {
      this.pending.splice(insertIndex, 0, job);
    }
  }

  private trimDeadLetter(): void {
    if (this.deadLetter.length > this.options.deadLetterMax) {
      const overflow = this.deadLetter.length - this.options.deadLetterMax;
      this.deadLetter.splice(0, overflow);
    }
  }

  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 2 + ID_RANDOM_LENGTH);
    return `${JOB_ID_PREFIX}_${timestamp}_${random}`;
  }
}

/** Factory function to create a new queue */
export function createQueue<T = unknown, R = unknown>(
  name: string,
  options?: QueueOptions,
  events?: QueueEvents<T>,
): Queue<T, R> {
  return new Queue<T, R>(name, options, events);
}
