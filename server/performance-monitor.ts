import { Request, Response, NextFunction } from 'express';
import { logPerformanceMetric, logger } from './logger';

// Performance metrics storage
interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  slowQueries: number;
  memoryUsage: NodeJS.MemoryUsage;
  lastUpdated: Date;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    averageResponseTime: 0,
    errorRate: 0,
    slowQueries: 0,
    memoryUsage: process.memoryUsage(),
    lastUpdated: new Date()
  };

  private responseTimes: number[] = [];
  private errorCount = 0;
  private readonly maxResponseTimes = 100; // Keep last 100 response times
  private readonly slowQueryThreshold = 1000; // 1 second

  // Middleware to track request performance
  trackRequest = (req: Request, res: Response, next: NextFunction) => {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any, cb?: any) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      const endMemory = process.memoryUsage();

      // Update metrics
      performanceMonitor.updateRequestMetrics(duration, res.statusCode >= 400);

      // Log performance data
      logPerformanceMetric('request_completed', duration, {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        memoryDelta: {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal
        },
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      // Check for slow requests
      if (duration > performanceMonitor.slowQueryThreshold) {
        logger.warn('Slow request detected', {
          method: req.method,
          path: req.path,
          duration: `${duration.toFixed(2)}ms`,
          statusCode: res.statusCode
        });
        performanceMonitor.metrics.slowQueries++;
      }

      return originalEnd.call(this, chunk, encoding, cb);
    };

    next();
  };

  // Update request metrics
  private updateRequestMetrics(responseTime: number, isError: boolean) {
    this.metrics.requestCount++;
    
    if (isError) {
      this.errorCount++;
    }

    // Update response times
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.maxResponseTimes) {
      this.responseTimes.shift();
    }

    // Calculate average response time
    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;

    // Calculate error rate
    this.metrics.errorRate = (this.errorCount / this.metrics.requestCount) * 100;

    // Update memory usage
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.lastUpdated = new Date();
  }

  // Track database query performance
  trackDatabaseQuery = async <T>(
    queryName: string,
    queryFunction: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await queryFunction();
      const duration = performance.now() - startTime;
      
      logPerformanceMetric('database_query', duration, {
        queryName,
        success: true
      });

      if (duration > this.slowQueryThreshold) {
        logger.warn('Slow database query detected', {
          queryName,
          duration: `${duration.toFixed(2)}ms`
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      logPerformanceMetric('database_query', duration, {
        queryName,
        success: false,
        error: (error as Error).message
      });

      throw error;
    }
  };

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Get detailed performance report
  getDetailedReport() {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      ...this.metrics,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        pid: process.pid
      },
      memoryUsage: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
      },
      performance: {
        responseTimes: {
          min: Math.min(...this.responseTimes),
          max: Math.max(...this.responseTimes),
          avg: this.metrics.averageResponseTime,
          p95: this.getPercentile(this.responseTimes, 0.95),
          p99: this.getPercentile(this.responseTimes, 0.99)
        }
      }
    };
  }

  // Calculate percentile
  private getPercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[index];
  }

  // Health check
  getHealthStatus() {
    const metrics = this.getMetrics();
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    const health = {
      status: 'healthy' as 'healthy' | 'warning' | 'critical',
      checks: {
        averageResponseTime: metrics.averageResponseTime < 1000,
        errorRate: metrics.errorRate < 5,
        memoryUsage: memoryUsagePercent < 90,
        slowQueries: metrics.slowQueries < 10
      },
      metrics: {
        averageResponseTime: `${metrics.averageResponseTime.toFixed(2)}ms`,
        errorRate: `${metrics.errorRate.toFixed(2)}%`,
        memoryUsage: `${memoryUsagePercent.toFixed(2)}%`,
        slowQueries: metrics.slowQueries
      }
    };

    // Determine overall status
    const failedChecks = Object.values(health.checks).filter(check => !check).length;
    
    if (failedChecks === 0) {
      health.status = 'healthy';
    } else if (failedChecks <= 2) {
      health.status = 'warning';
    } else {
      health.status = 'critical';
    }

    return health;
  }

  // Reset metrics
  resetMetrics() {
    this.metrics = {
      requestCount: 0,
      averageResponseTime: 0,
      errorRate: 0,
      slowQueries: 0,
      memoryUsage: process.memoryUsage(),
      lastUpdated: new Date()
    };
    this.responseTimes = [];
    this.errorCount = 0;
    
    logger.info('Performance metrics reset');
  }

  // Start periodic logging
  startPeriodicLogging(intervalMs: number = 60000) { // Default: 1 minute
    setInterval(() => {
      const report = this.getDetailedReport();
      logger.info('Periodic performance report', report);
    }, intervalMs);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility function for timing operations
export const timeOperation = async <T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> => {
  return performanceMonitor.trackDatabaseQuery(operationName, operation);
};

// Decorator for timing class methods
export function timed(operationName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const name = operationName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return timeOperation(name, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}