import { CONNECTION_FAILED } from './const/generals';
import { ZERO } from './const/numbers';
import type { Logger } from '../types';

export interface ConnectionQueue {
  enqueue(work: () => Promise<unknown>): void;
  hasPending(): boolean;
  awaitAll(): Promise<void>;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export function createConnectionQueue(logger: Logger): ConnectionQueue {
  const tasks: Array<() => Promise<unknown>> = [];
  let running: Promise<void> | null = null;
  let reported: Error | null = null;

  function kick(): void {
    const isBusy = Boolean(running);
    const isEmpty = tasks.length === ZERO;
    const hasFailure = reported !== null;
    if (isBusy || isEmpty || hasFailure) return;
    running = drain();
  }

  async function drain(): Promise<void> {
    try {
      while (tasks.length > ZERO) {
        const work = tasks.shift();
        if (!work) break;
        try {
          await work();
        } catch (error) {
          reported = toError(error);
          logger.error(CONNECTION_FAILED, reported);
          tasks.length = ZERO;
          break;
        }
      }
    } finally {
      running = null;
      kick();
    }
  }

  return {
    enqueue(work: () => Promise<unknown>): void {
      tasks.push(work);
      kick();
    },

    hasPending(): boolean {
      const hasTasks = tasks.length > ZERO;
      const isRunning = running !== null;
      const hasFailure = reported !== null;
      return hasTasks || isRunning || hasFailure;
    },

    async awaitAll(): Promise<void> {
      while (running || tasks.length > ZERO) {
        kick();
        if (!running) break;
        await running;
      }
      if (!reported) return;
      const failure = reported;
      reported = null;
      throw failure;
    },
  };
}
