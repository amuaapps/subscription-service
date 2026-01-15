export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

export class Logger implements ILogger {
  private readonly redactPaths: string[];
  private readonly pretty: boolean;
  private readonly level: LogLevel;

  constructor(
    level: LogLevel = 'info',
    pretty = false,
    redactPaths: string[] = ['password', 'apiKey', 'secret', 'token']
  ) {
    this.level = level;
    this.pretty = pretty;
    this.redactPaths = redactPaths;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      this.log('info', message, context);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      this.log('warn', message, context);
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      this.log('error', message, context);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const sanitizedContext = context ? this.sanitize(context) : {};

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(sanitizedContext as Record<string, unknown>),
    };

    const output = this.pretty ? JSON.stringify(logEntry, null, 2) : JSON.stringify(logEntry);

    if (level === 'error') {
      // eslint-disable-next-line no-console
      console.error(output);
    } else {
      // eslint-disable-next-line no-console
      console.log(output);
    }
  }

  private sanitize(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (this.shouldRedact(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private shouldRedact(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return this.redactPaths.some((path) => lowerKey.includes(path.toLowerCase()));
  }
}

export function createLogger(
  level: LogLevel = 'info',
  pretty = false,
  redactPaths?: string[]
): ILogger {
  return new Logger(level, pretty, redactPaths);
}
