/**
 * 에러 핸들러 미들웨어
 * TRD 섹션 8.2 에러 응답 형식 준수
 */
import { Context } from 'hono';
import { ZodError } from 'zod';
import type { Env } from '../types';

/**
 * 커스텀 API 에러 클래스
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 검증 에러 (Zod)
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: any[]) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * 인증 에러
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = '인증이 필요합니다.') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 권한 에러
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = '권한이 없습니다.') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * 리소스 없음 에러
 */
export class NotFoundError extends ApiError {
  constructor(message: string = '요청한 리소스를 찾을 수 없습니다.') {
    super('NOT_FOUND', message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Rate Limit 에러
 */
export class RateLimitError extends ApiError {
  constructor(message: string = '요청 횟수 제한을 초과했습니다.') {
    super('RATE_LIMIT_EXCEEDED', message, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Zod 에러를 API 에러 포맷으로 변환
 */
function formatZodError(error: ZodError) {
  const details = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return {
    code: 'VALIDATION_ERROR',
    message: '입력값이 올바르지 않습니다.',
    details,
  };
}

/**
 * 글로벌 에러 핸들러
 */
export function errorHandler(err: Error, c: Context<Env>) {
  console.error('Error:', {
    requestId: c.get('requestId'),
    error: err.message,
    stack: err.stack,
  });

  // Zod 검증 에러
  if (err instanceof ZodError) {
    return c.json(
      {
        error: formatZodError(err),
      },
      400
    );
  }

  // 커스텀 API 에러
  if (err instanceof ApiError) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details && { details: err.details }),
        },
      },
      err.statusCode as any
    );
  }

  // 알 수 없는 에러 (프로덕션에서는 상세 정보 숨김)
  const isDevelopment = c.env.ENVIRONMENT === 'development';

  return c.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: isDevelopment
          ? err.message
          : '서버 내부 오류가 발생했습니다.',
        ...(isDevelopment && { stack: err.stack }),
      },
    },
    500
  );
}
