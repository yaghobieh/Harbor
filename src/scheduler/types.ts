export interface Job {
  id: string;
  name: string;
  schedule: string | number;
  handler: () => void | Promise<void>;
  enabled: boolean;
  lastRun: Date | null;
  nextRun: Date | null;
  runCount: number;
  errors: number;
}

export interface SchedulerOptions {
  timezone?: string;
  onJobStart?: (job: Job) => void;
  onJobComplete?: (job: Job, duration: number) => void;
  onJobError?: (job: Job, error: Error) => void;
}

export interface ParsedCron {
  minute: number[];
  hour: number[];
  dayOfMonth: number[];
  month: number[];
  dayOfWeek: number[];
}

