import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'wholewellness-api' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, log to the console with a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create logs directory if it doesn't exist
import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  
  // Log request
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).user?.id
  });

  // Override res.json to capture response
  const originalJson = res.json;
  let responseBody: any;
  
  res.json = function(body: any) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  res.on('finish', () => {
    const duration = performance.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      ip: req.ip,
      userId: (req as any).user?.id
    };

    if (res.statusCode >= 400) {
      logger.error('Request failed', {
        ...logData,
        error: responseBody?.error || responseBody?.message
      });
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};

// Error logging middleware
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: (req as any).user?.id,
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  next(err);
};

// Payment logging function
export const logPaymentEvent = (event: string, data: any, userId?: string) => {
  logger.info('Payment event', {
    event,
    data,
    userId,
    timestamp: new Date().toISOString()
  });
};

// Security event logging
export const logSecurityEvent = (event: string, details: any, req?: Request) => {
  logger.warn('Security event', {
    event,
    details,
    ip: req?.ip,
    userAgent: req?.get('User-Agent'),
    url: req?.url,
    method: req?.method,
    timestamp: new Date().toISOString()
  });
};

// Authentication logging
export const logAuthEvent = (event: string, userId: string, details?: any, req?: Request) => {
  logger.info('Authentication event', {
    event,
    userId,
    details,
    ip: req?.ip,
    userAgent: req?.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
};

// Database operation logging
export const logDatabaseEvent = (operation: string, table: string, details?: any, userId?: string) => {
  logger.info('Database operation', {
    operation,
    table,
    details,
    userId,
    timestamp: new Date().toISOString()
  });
};

// Performance monitoring
export const logPerformanceMetric = (metric: string, value: number, context?: any) => {
  logger.info('Performance metric', {
    metric,
    value,
    context,
    timestamp: new Date().toISOString()
  });
};

// Export the logger instance for direct use
export { logger };

// Convenience logging functions
export const log = {
  info: (message: string, meta?: any) => logger.info(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  error: (message: string, meta?: any) => logger.error(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta)
};