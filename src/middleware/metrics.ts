// Prometheus-compatible Metrics for Harbor
import { RequestHandler } from 'express';
// Prometheus-compatible Metrics for Harbor

export interface MetricsOptions {
  path?: string;
  prefix?: string;
  defaultLabels?: Record<string, string>;
  collectDefaultMetrics?: boolean;
  requestDurationBuckets?: number[];
  requestSizeBuckets?: number[];
  responseSizeBuckets?: number[];
}

interface Metric {
  name: string;
  help: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  values: Map<string, number | number[]>;
  buckets?: number[];
}

export class MetricsRegistry {
  private metrics: Map<string, Metric> = new Map();
  private prefix: string;
  private defaultLabels: Record<string, string>;

  constructor(prefix = 'harbor_', defaultLabels: Record<string, string> = {}) {
    this.prefix = prefix;
    this.defaultLabels = defaultLabels;
  }

  // Counter - only goes up
  counter(name: string, help: string): Counter {
    const fullName = this.prefix + name;
    if (!this.metrics.has(fullName)) {
      this.metrics.set(fullName, {
        name: fullName,
        help,
        type: 'counter',
        values: new Map(),
      });
    }
    return new Counter(this.metrics.get(fullName)!, this.defaultLabels);
  }

  // Gauge - can go up and down
  gauge(name: string, help: string): Gauge {
    const fullName = this.prefix + name;
    if (!this.metrics.has(fullName)) {
      this.metrics.set(fullName, {
        name: fullName,
        help,
        type: 'gauge',
        values: new Map(),
      });
    }
    return new Gauge(this.metrics.get(fullName)!, this.defaultLabels);
  }

  // Histogram - observations in buckets
  histogram(name: string, help: string, buckets: number[] = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]): Histogram {
    const fullName = this.prefix + name;
    if (!this.metrics.has(fullName)) {
      this.metrics.set(fullName, {
        name: fullName,
        help,
        type: 'histogram',
        values: new Map(),
        buckets,
      });
    }
    return new Histogram(this.metrics.get(fullName)!, this.defaultLabels);
  }

  // Get all metrics in Prometheus format
  getMetrics(): string {
    const lines: string[] = [];

    for (const metric of this.metrics.values()) {
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      lines.push(`# TYPE ${metric.name} ${metric.type}`);

      if (metric.type === 'histogram') {
        // Group by labels and output histogram format
        const labelGroups = new Map<string, { sum: number; count: number; buckets: Map<number, number> }>();
        
        for (const [key, value] of metric.values.entries()) {
          const [labelsStr, bucket] = key.split('|');
          if (!labelGroups.has(labelsStr)) {
            labelGroups.set(labelsStr, { sum: 0, count: 0, buckets: new Map() });
          }
          const group = labelGroups.get(labelsStr)!;
          
          if (bucket === 'sum') {
            group.sum = value as number;
          } else if (bucket === 'count') {
            group.count = value as number;
          } else {
            group.buckets.set(parseFloat(bucket), value as number);
          }
        }

        for (const [labelsStr, group] of labelGroups.entries()) {
          const labels = labelsStr ? `{${labelsStr}}` : '';
          let cumulative = 0;
          
          for (const bucket of metric.buckets || []) {
            cumulative += group.buckets.get(bucket) || 0;
            const bucketLabels = labelsStr ? `{${labelsStr},le="${bucket}"}` : `{le="${bucket}"}`;
            lines.push(`${metric.name}_bucket${bucketLabels} ${cumulative}`);
          }
          
          const infLabels = labelsStr ? `{${labelsStr},le="+Inf"}` : `{le="+Inf"}`;
          lines.push(`${metric.name}_bucket${infLabels} ${group.count}`);
          lines.push(`${metric.name}_sum${labels} ${group.sum}`);
          lines.push(`${metric.name}_count${labels} ${group.count}`);
        }
      } else {
        for (const [labels, value] of metric.values.entries()) {
          const labelsStr = labels ? `{${labels}}` : '';
          lines.push(`${metric.name}${labelsStr} ${value}`);
        }
      }
    }

    return lines.join('\n');
  }

  reset(): void {
    for (const metric of this.metrics.values()) {
      metric.values.clear();
    }
  }
}

class Counter {
  private metric: Metric;
  private defaultLabels: Record<string, string>;

  constructor(metric: Metric, defaultLabels: Record<string, string>) {
    this.metric = metric;
    this.defaultLabels = defaultLabels;
  }

  inc(labels: Record<string, string> = {}, value = 1): void {
    const key = this.labelsToString({ ...this.defaultLabels, ...labels });
    const current = (this.metric.values.get(key) as number) || 0;
    this.metric.values.set(key, current + value);
  }

  private labelsToString(labels: Record<string, string>): string {
    return Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }
}

class Gauge {
  private metric: Metric;
  private defaultLabels: Record<string, string>;

  constructor(metric: Metric, defaultLabels: Record<string, string>) {
    this.metric = metric;
    this.defaultLabels = defaultLabels;
  }

  set(value: number, labels: Record<string, string> = {}): void {
    const key = this.labelsToString({ ...this.defaultLabels, ...labels });
    this.metric.values.set(key, value);
  }

  inc(labels: Record<string, string> = {}, value = 1): void {
    const key = this.labelsToString({ ...this.defaultLabels, ...labels });
    const current = (this.metric.values.get(key) as number) || 0;
    this.metric.values.set(key, current + value);
  }

  dec(labels: Record<string, string> = {}, value = 1): void {
    const key = this.labelsToString({ ...this.defaultLabels, ...labels });
    const current = (this.metric.values.get(key) as number) || 0;
    this.metric.values.set(key, current - value);
  }

  private labelsToString(labels: Record<string, string>): string {
    return Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }
}

class Histogram {
  private metric: Metric;
  private defaultLabels: Record<string, string>;

  constructor(metric: Metric, defaultLabels: Record<string, string>) {
    this.metric = metric;
    this.defaultLabels = defaultLabels;
  }

  observe(value: number, labels: Record<string, string> = {}): void {
    const labelsStr = this.labelsToString({ ...this.defaultLabels, ...labels });
    
    // Update sum
    const sumKey = `${labelsStr}|sum`;
    const currentSum = (this.metric.values.get(sumKey) as number) || 0;
    this.metric.values.set(sumKey, currentSum + value);

    // Update count
    const countKey = `${labelsStr}|count`;
    const currentCount = (this.metric.values.get(countKey) as number) || 0;
    this.metric.values.set(countKey, currentCount + 1);

    // Update buckets
    for (const bucket of this.metric.buckets || []) {
      if (value <= bucket) {
        const bucketKey = `${labelsStr}|${bucket}`;
        const current = (this.metric.values.get(bucketKey) as number) || 0;
        this.metric.values.set(bucketKey, current + 1);
      }
    }
  }

  startTimer(labels: Record<string, string> = {}): () => void {
    const start = process.hrtime.bigint();
    return () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1e9; // Convert to seconds
      this.observe(duration, labels);
    };
  }

  private labelsToString(labels: Record<string, string>): string {
    return Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }
}

// Global registry instance
export const defaultRegistry = new MetricsRegistry();

// Pre-built metrics
export const httpRequestsTotal = defaultRegistry.counter(
  'http_requests_total',
  'Total number of HTTP requests'
);

export const httpRequestDuration = defaultRegistry.histogram(
  'http_request_duration_seconds',
  'HTTP request duration in seconds'
);

export const httpRequestSize = defaultRegistry.histogram(
  'http_request_size_bytes',
  'HTTP request size in bytes',
  [100, 1000, 10000, 100000, 1000000]
);

export const httpResponseSize = defaultRegistry.histogram(
  'http_response_size_bytes',
  'HTTP response size in bytes',
  [100, 1000, 10000, 100000, 1000000]
);

/**
 * Metrics collection middleware
 */
export function metricsMiddleware(): RequestHandler {
  return (req, res, next) => {
    const timer = httpRequestDuration.startTimer({
      method: req.method,
      path: req.route?.path || req.path,
    });

    const requestSize = parseInt(req.get('content-length') || '0', 10);
    if (requestSize > 0) {
      httpRequestSize.observe(requestSize, { method: req.method });
    }

    res.on('finish', () => {
      timer();
      
      httpRequestsTotal.inc({
        method: req.method,
        path: req.route?.path || req.path,
        status: res.statusCode.toString(),
      });

      const responseSize = parseInt(res.get('content-length') || '0', 10);
      if (responseSize > 0) {
        httpResponseSize.observe(responseSize, {
          method: req.method,
          status: res.statusCode.toString(),
        });
      }
    });

    next();
  };
}

/**
 * Metrics endpoint handler
 */
export function metricsEndpoint(registry = defaultRegistry): RequestHandler {
  return (_req, res) => {
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(registry.getMetrics());
  };
}

export { Counter, Gauge, Histogram };

