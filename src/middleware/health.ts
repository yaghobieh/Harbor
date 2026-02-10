// Health Check Middleware for Harbor
import { RequestHandler } from 'express';
// Health Check Middleware

export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency?: number;
  message?: string;
  details?: Record<string, unknown>;
}

export interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult>;
  critical?: boolean;
  timeout?: number;
}

export interface HealthOptions {
  path?: string;
  checks?: HealthCheck[];
  timeout?: number;
  onHealthCheck?: (results: HealthCheckResult[]) => void;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version?: string;
  checks: HealthCheckResult[];
}

const startTime = Date.now();

/**
 * Create health check endpoint
 * 
 * @example
 * app.use(healthCheck({
 *   checks: [
 *     mongoHealthCheck(connection),
 *     redisHealthCheck(redisClient),
 *     customHealthCheck('api', async () => { ... }),
 *   ],
 * }));
 */
export function healthCheck(options: HealthOptions = {}): RequestHandler {
  const {
    checks = [],
    timeout = 5000,
    onHealthCheck,
  } = options;

  return async (_req, res) => {
    const results: HealthCheckResult[] = [];
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    // Run all health checks in parallel with timeout
    const checkPromises = checks.map(async (check) => {
      const startTime = Date.now();
      
      try {
        const result = await Promise.race([
          check.check(),
          new Promise<HealthCheckResult>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), check.timeout || timeout)
          ),
        ]);
        
        result.latency = Date.now() - startTime;
        return result;
      } catch (error) {
        return {
          name: check.name,
          status: 'unhealthy' as const,
          latency: Date.now() - startTime,
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const checkResults = await Promise.all(checkPromises);
    results.push(...checkResults);

    // Determine overall status
    for (const result of results) {
      if (result.status === 'unhealthy') {
        const check = checks.find((c) => c.name === result.name);
        if (check?.critical !== false) {
          overallStatus = 'unhealthy';
          break;
        } else {
          overallStatus = 'degraded';
        }
      } else if (result.status === 'degraded' && overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      checks: results,
    };

    onHealthCheck?.(results);

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  };
}

// Pre-built health checks

/**
 * MongoDB health check
 */
export function mongoHealthCheck(connection: any, name = 'mongodb'): HealthCheck {
  return {
    name,
    critical: true,
    check: async () => {
      try {
        if (connection.readyState === 1) {
          await connection.db?.admin().ping();
          return { name, status: 'healthy', message: 'Connected' };
        }
        return { name, status: 'unhealthy', message: 'Not connected' };
      } catch (error) {
        return {
          name,
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Connection failed',
        };
      }
    },
  };
}

/**
 * Redis health check
 */
export function redisHealthCheck(client: any, name = 'redis'): HealthCheck {
  return {
    name,
    critical: false,
    check: async () => {
      try {
        const pong = await client.ping();
        if (pong === 'PONG') {
          return { name, status: 'healthy', message: 'Connected' };
        }
        return { name, status: 'unhealthy', message: 'Invalid response' };
      } catch (error) {
        return {
          name,
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Connection failed',
        };
      }
    },
  };
}

/**
 * Memory health check
 */
export function memoryHealthCheck(
  maxHeapMB = 512,
  name = 'memory'
): HealthCheck {
  return {
    name,
    critical: false,
    check: async () => {
      const usage = process.memoryUsage();
      const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
      const rssMB = Math.round(usage.rss / 1024 / 1024);

      const status = heapUsedMB > maxHeapMB ? 'degraded' : 'healthy';

      return {
        name,
        status,
        message: `Heap: ${heapUsedMB}MB / ${heapTotalMB}MB`,
        details: {
          heapUsed: heapUsedMB,
          heapTotal: heapTotalMB,
          rss: rssMB,
          external: Math.round(usage.external / 1024 / 1024),
        },
      };
    },
  };
}

/**
 * Disk health check (requires 'check-disk-space' package)
 */
export function diskHealthCheck(
  _path = '/',
  _minFreeGB = 1,
  name = 'disk'
): HealthCheck {
  return {
    name,
    critical: false,
    check: async () => {
      // Disk space check requires 'check-disk-space' package
      return {
        name,
        status: 'healthy',
        message: 'Disk check requires check-disk-space package',
      };
    },
  };
}

/**
 * Custom health check
 */
export function customHealthCheck(
  name: string,
  checkFn: () => Promise<boolean | { healthy: boolean; message?: string }>,
  critical = false
): HealthCheck {
  return {
    name,
    critical,
    check: async () => {
      try {
        const result = await checkFn();
        if (typeof result === 'boolean') {
          return {
            name,
            status: result ? 'healthy' : 'unhealthy',
          };
        }
        return {
          name,
          status: result.healthy ? 'healthy' : 'unhealthy',
          message: result.message,
        };
      } catch (error) {
        return {
          name,
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Check failed',
        };
      }
    },
  };
}

