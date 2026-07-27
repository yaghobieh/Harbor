import { createLogger } from '../utils/logger';
import type { Job, SchedulerOptions, ParsedCron } from './types';

const logger = createLogger('scheduler');

export class Scheduler {
  private jobs: Map<string, Job> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private options: SchedulerOptions;
  private running = false;

  constructor(options: SchedulerOptions = {}) {
    this.options = options;
  }

  cron(name: string, expression: string, handler: () => void | Promise<void>): Job {
    const id = this.generateId();
    const job: Job = {
      id,
      name,
      schedule: expression,
      handler,
      enabled: true,
      lastRun: null,
      nextRun: this.getNextCronRun(expression),
      runCount: 0,
      errors: 0,
    };

    this.jobs.set(id, job);
    if (this.running) {
      this.scheduleJob(job);
    }

    logger.info(`Scheduled cron job: ${name} (${expression})`);
    return job;
  }

  every(interval: string, name: string, handler: () => void | Promise<void>): Job {
    const ms = this.parseInterval(interval);
    const id = this.generateId();
    const job: Job = {
      id,
      name,
      schedule: ms,
      handler,
      enabled: true,
      lastRun: null,
      nextRun: new Date(Date.now() + ms),
      runCount: 0,
      errors: 0,
    };

    this.jobs.set(id, job);
    if (this.running) {
      this.scheduleIntervalJob(job);
    }

    logger.info(`Scheduled interval job: ${name} (every ${interval})`);
    return job;
  }

  at(date: Date, name: string, handler: () => void | Promise<void>): Job {
    const id = this.generateId();
    const delay = date.getTime() - Date.now();

    if (delay < 0) {
      throw new Error(`Cannot schedule job in the past: ${date}`);
    }

    const job: Job = {
      id,
      name,
      schedule: date.getTime(),
      handler,
      enabled: true,
      lastRun: null,
      nextRun: date,
      runCount: 0,
      errors: 0,
    };

    this.jobs.set(id, job);
    if (this.running) {
      const timer = setTimeout(() => this.runJob(job), delay);
      this.timers.set(id, timer);
    }

    logger.info(`Scheduled one-time job: ${name} at ${date.toISOString()}`);
    return job;
  }

  start(): void {
    if (this.running) return;
    this.running = true;

    this.jobs.forEach((job) => {
      if (typeof job.schedule === 'string') {
        this.scheduleJob(job);
      } else {
        this.scheduleIntervalJob(job);
      }
    });

    logger.info('Scheduler started');
  }

  stop(): void {
    this.running = false;
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    logger.info('Scheduler stopped');
  }

  cancel(jobId: string): boolean {
    const timer = this.timers.get(jobId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(jobId);
    }
    return this.jobs.delete(jobId);
  }

  pause(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job) {
      job.enabled = false;
      const timer = this.timers.get(jobId);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(jobId);
      }
      return true;
    }
    return false;
  }

  resume(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job) {
      job.enabled = true;
      if (this.running) {
        if (typeof job.schedule === 'string') {
          this.scheduleJob(job);
        } else {
          this.scheduleIntervalJob(job);
        }
      }
      return true;
    }
    return false;
  }

  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  getJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  private async runJob(job: Job): Promise<void> {
    if (!job.enabled) return;

    const startTime = Date.now();
    this.options.onJobStart?.(job);

    try {
      await job.handler();
      job.lastRun = new Date();
      job.runCount++;
      const duration = Date.now() - startTime;
      this.options.onJobComplete?.(job, duration);
      logger.debug(`Job ${job.name} completed in ${duration}ms`);
    } catch (err) {
      const error = err as Error;
      job.errors++;
      logger.error(`Job ${job.name} failed: ${error.message}`);
      this.options.onJobError?.(job, error);
    }

    if (typeof job.schedule === 'string') {
      job.nextRun = this.getNextCronRun(job.schedule);
      this.scheduleJob(job);
    } else if (typeof job.schedule === 'number' && job.schedule > 0) {
      job.nextRun = new Date(Date.now() + job.schedule);
      this.scheduleIntervalJob(job);
    }
  }

  private scheduleJob(job: Job): void {
    if (!job.nextRun) return;

    const delay = job.nextRun.getTime() - Date.now();
    if (delay < 0) {
      job.nextRun = this.getNextCronRun(job.schedule as string);
      this.scheduleJob(job);
      return;
    }

    const timer = setTimeout(() => this.runJob(job), delay);
    this.timers.set(job.id, timer);
  }

  private scheduleIntervalJob(job: Job): void {
    const interval = job.schedule as number;
    const timer = setTimeout(() => this.runJob(job), interval);
    this.timers.set(job.id, timer);
  }

  private parseInterval(interval: string): number {
    const match = interval.match(/^(\d+)(s|m|h|d|w)$/);
    if (!match) {
      throw new Error(`Invalid interval format: ${interval}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }

  private getNextCronRun(expression: string): Date {
    const parsed = this.parseCron(expression);
    const now = new Date();
    const next = new Date(now);

    for (let i = 0; i < 366 * 24 * 60; i++) {
      next.setMinutes(next.getMinutes() + 1);
      next.setSeconds(0);
      next.setMilliseconds(0);

      if (this.matchesCron(next, parsed)) {
        return next;
      }
    }

    throw new Error(`Could not find next run for: ${expression}`);
  }

  private parseCron(expression: string): ParsedCron {
    const parts = expression.split(' ');
    if (parts.length !== 5) {
      throw new Error(`Invalid cron expression: ${expression}`);
    }

    return {
      minute: this.parseCronField(parts[0], 0, 59),
      hour: this.parseCronField(parts[1], 0, 23),
      dayOfMonth: this.parseCronField(parts[2], 1, 31),
      month: this.parseCronField(parts[3], 1, 12),
      dayOfWeek: this.parseCronField(parts[4], 0, 6),
    };
  }

  private parseCronField(field: string, min: number, max: number): number[] {
    if (field === '*') {
      return Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }

    const values: number[] = [];

    field.split(',').forEach((part) => {
      if (part.includes('/')) {
        const [range, step] = part.split('/');
        const stepNum = parseInt(step, 10);
        const rangeValues = range === '*' 
          ? Array.from({ length: max - min + 1 }, (_, i) => min + i)
          : this.parseCronField(range, min, max);
        rangeValues.forEach((v, i) => {
          if (i % stepNum === 0) values.push(v);
        });
      } else if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          values.push(i);
        }
      } else {
        values.push(parseInt(part, 10));
      }
    });

    return [...new Set(values)].sort((a, b) => a - b);
  }

  private matchesCron(date: Date, parsed: ParsedCron): boolean {
    return (
      parsed.minute.includes(date.getMinutes()) &&
      parsed.hour.includes(date.getHours()) &&
      parsed.dayOfMonth.includes(date.getDate()) &&
      parsed.month.includes(date.getMonth() + 1) &&
      parsed.dayOfWeek.includes(date.getDay())
    );
  }

  private generateId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export function createScheduler(options?: SchedulerOptions): Scheduler {
  return new Scheduler(options);
}

