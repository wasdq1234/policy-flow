/**
 * 인증 미들웨어
 * TRD 섹션 7.8 참조
 *
 * - requireAuth: 로그인 필수
 * - optionalAuth: 로그인 선택 (Guest 허용)
 */
import { createMiddleware } from 'hono/factory';
import type { Env } from '../types';
import { UnauthorizedError } from './error-handler';
import { verifyToken as jwtVerify } from '../utils/jwt';

/**
 * 사용자 정보 타입
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

/**
 * Context에 사용자 정보 타입 추가
 */
declare module 'hono' {
  interface ContextVariableMap {
    user?: AuthUser;
  }
}

/**
 * JWT 검증
 * - Access Token 파싱
 * - 서명 검증
 * - 만료 시간 확인
 * - 사용자 정보 추출
 */
async function verifyToken(token: string, secret: string): Promise<AuthUser | null> {
  const payload = jwtVerify(token, secret);

  if (!payload || payload.type !== 'access') {
    return null;
  }

  return {
    id: payload.userId,
    email: payload.email || '',
    name: payload.email || 'User',
    role: 'user',
  };
}

/**
 * Authorization 헤더에서 토큰 추출
 */
function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

/**
 * 로그인 필수 미들웨어
 * Guest 접근 차단
 */
export const requireAuth = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = extractToken(authHeader);

  if (!token) {
    throw new UnauthorizedError('인증 토큰이 필요합니다.');
  }

  const jwtSecret = c.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  const user = await verifyToken(token, jwtSecret);

  if (!user) {
    throw new UnauthorizedError('유효하지 않은 인증 토큰입니다.');
  }

  c.set('user', user);
  await next();
});

/**
 * 로그인 선택 미들웨어
 * Guest 허용, 토큰이 있으면 검증
 */
export const optionalAuth = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const token = extractToken(authHeader);

  if (token) {
    const jwtSecret = c.env.JWT_SECRET;
    if (jwtSecret) {
      const user = await verifyToken(token, jwtSecret);
      if (user) {
        c.set('user', user);
      }
    }
  }

  // Guest도 허용
  await next();
});

/**
 * Admin 권한 체크 미들웨어
 * requireAuth 이후에 사용
 */
export const requireAdmin = createMiddleware<Env>(async (c, next) => {
  const user = c.get('user');

  if (!user || user.role !== 'admin') {
    throw new UnauthorizedError('관리자 권한이 필요합니다.');
  }

  await next();
});
