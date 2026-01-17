/**
 * Health Check 라우트
 * 서비스 상태 확인 및 모니터링용
 */
import { Hono } from 'hono';
import type { Env } from '../types';

const health = new Hono<Env>();

/**
 * GET /health
 * 서비스 기본 상태 확인
 */
health.get('/', (c) => {
  return c.json({
    status: 'ok',
    environment: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/db
 * 데이터베이스 연결 상태 확인
 */
health.get('/db', async (c) => {
  try {
    // D1 데이터베이스 연결 테스트
    await c.env.DB.prepare('SELECT 1 as test').first();

    return c.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      503 as any
    );
  }
});

export default health;
