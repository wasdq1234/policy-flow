/**
 * 테스트 유틸리티 함수 모음
 * HTTP 요청 테스트, Mock 생성 등
 */
import app from '@/index';
import type { D1Database } from '@cloudflare/workers-types';
import { MockD1Database } from './db-mock';

/**
 * 테스트용 앱 인스턴스 생성
 */
export function createTestApp() {
  return app;
}

/**
 * 테스트 요청 헬퍼
 * Hono 앱에 HTTP 요청을 보내고 응답을 반환
 */
export async function testRequest(
  method: string,
  path: string,
  options?: {
    body?: any;
    headers?: Record<string, string>;
    env?: any;
  }
) {
  const testApp = createTestApp();

  const req = new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  // Cloudflare Workers 환경 모킹
  const env = options?.env || createMockEnv();

  return testApp.fetch(req, env);
}

/**
 * Mock Cloudflare Workers 환경 생성
 */
export function createMockEnv() {
  return {
    DB: createMockDb(),
    ENVIRONMENT: 'test',
    JWT_SECRET: 'test-secret-key-for-jwt',
    JWT_ACCESS_EXPIRY: '3600',
    JWT_REFRESH_EXPIRY: '604800',
  };
}

/**
 * Mock D1 Database 생성
 * 실제 D1 API를 모방하는 간단한 mock
 */
export function createMockDb(): D1Database {
  return new MockD1Database() as unknown as D1Database;
}

/**
 * Mock 사용자 세션/토큰 생성
 */
export function createMockAuthToken(userId: string = 'test-user-id'): string {
  // 간단한 테스트용 토큰 (실제로는 JWT 등 사용)
  return `mock-token-${userId}`;
}

/**
 * JSON 응답 파싱 헬퍼
 */
export async function parseJsonResponse<T>(response: Response): Promise<T> {
  return await response.json() as T;
}
