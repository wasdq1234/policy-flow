/**
 * 로깅 유틸리티
 * Cloudflare Workers 환경에 최적화
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * 로그 메시지 포맷
 */
function formatLog(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

/**
 * Logger 클래스
 */
export class Logger {
  constructor(private defaultContext?: LogContext) {}

  debug(message: string, context?: LogContext) {
    const mergedContext = { ...this.defaultContext, ...context };
    console.debug(formatLog('debug', message, mergedContext));
  }

  info(message: string, context?: LogContext) {
    const mergedContext = { ...this.defaultContext, ...context };
    console.info(formatLog('info', message, mergedContext));
  }

  warn(message: string, context?: LogContext) {
    const mergedContext = { ...this.defaultContext, ...context };
    console.warn(formatLog('warn', message, mergedContext));
  }

  error(message: string, error?: Error, context?: LogContext) {
    const mergedContext = {
      ...this.defaultContext,
      ...context,
      ...(error && {
        error: error.message,
        stack: error.stack,
      }),
    };
    console.error(formatLog('error', message, mergedContext));
  }
}

/**
 * 기본 로거 인스턴스
 */
export const logger = new Logger();

/**
 * Request ID를 포함한 로거 생성
 */
export function createLogger(requestId: string): Logger {
  return new Logger({ requestId });
}
