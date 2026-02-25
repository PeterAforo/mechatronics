/**
 * Structured Logging Utility
 * 
 * Provides consistent logging across the application with:
 * - Log levels (debug, info, warn, error)
 * - Structured JSON output for production
 * - Context enrichment (request ID, user ID, etc.)
 * - Performance timing
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  requestId?: string;
  userId?: string;
  tenantId?: string;
  action?: string;
  duration?: number;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL as LogLevel;
  if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
    return envLevel;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
};

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel()];
}

function formatLogEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === "production") {
    // JSON format for production (easier to parse by log aggregators)
    return JSON.stringify(entry);
  }
  
  // Pretty format for development
  const levelColors: Record<LogLevel, string> = {
    debug: "\x1b[36m", // cyan
    info: "\x1b[32m",  // green
    warn: "\x1b[33m",  // yellow
    error: "\x1b[31m", // red
  };
  const reset = "\x1b[0m";
  const color = levelColors[entry.level];
  
  let output = `${color}[${entry.level.toUpperCase()}]${reset} ${entry.message}`;
  
  if (entry.context && Object.keys(entry.context).length > 0) {
    output += ` ${JSON.stringify(entry.context)}`;
  }
  
  if (entry.error) {
    output += `\n  Error: ${entry.error.message}`;
    if (entry.error.stack && String(process.env.NODE_ENV) !== "production") {
      output += `\n  ${entry.error.stack}`;
    }
  }
  
  return output;
}

function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  const output = formatLogEntry(entry);

  switch (level) {
    case "debug":
      console.debug(output);
      break;
    case "info":
      console.info(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "error":
      console.error(output);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log("debug", message, context),
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext, error?: Error) => log("error", message, context, error),
};

/**
 * Create a logger with pre-filled context
 */
export function createLogger(baseContext: LogContext) {
  return {
    debug: (message: string, context?: LogContext) => 
      logger.debug(message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) => 
      logger.info(message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext) => 
      logger.warn(message, { ...baseContext, ...context }),
    error: (message: string, context?: LogContext, error?: Error) => 
      logger.error(message, { ...baseContext, ...context }, error),
  };
}

/**
 * Performance timer for measuring operation duration
 */
export function startTimer(): () => number {
  const start = performance.now();
  return () => Math.round(performance.now() - start);
}

/**
 * Log API request/response
 */
export function logApiRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  context?: LogContext
) {
  const level: LogLevel = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
  logger[level](`${method} ${path} ${statusCode}`, {
    ...context,
    method,
    path,
    statusCode,
    duration,
  });
}

/**
 * Log database query
 */
export function logDbQuery(
  operation: string,
  model: string,
  duration: number,
  context?: LogContext
) {
  logger.debug(`DB ${operation} ${model}`, {
    ...context,
    operation,
    model,
    duration,
  });
}

export default logger;
