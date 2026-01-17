/**
 * 요청 ID 미들웨어
 * 모든 요청에 고유 ID를 부여하여 디버깅 및 추적을 용이하게 함
 */
import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';

export const requestIdMiddleware = createMiddleware<Env>(async (c, next) => {
  const requestId = crypto.randomUUID();

  // Context에 저장
  c.set('requestId', requestId);

  // 응답 헤더에 추가
  await next();
  c.header('X-Request-Id', requestId);
});

// Context에 requestId 타입 추가를 위한 확장
declare module 'hono' {
  interface ContextVariableMap {
    requestId: string;
  }
}
