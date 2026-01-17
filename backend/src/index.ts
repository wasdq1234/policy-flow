/**
 * PolicyFlow Backend API
 * Cloudflare Workers + Hono 기반 서버리스 API
 */
import { Hono } from 'hono';
import type { Env } from './types';
import type { ExecutionContext } from '@cloudflare/workers-types';

// 미들웨어
import { corsMiddleware } from './middleware/cors';
import { requestIdMiddleware } from './middleware/request-id';
import { errorHandler } from './middleware/error-handler';

// 라우트
import { health, v1 } from './routes';

// Cron
import { handleScheduled } from './cron/send-notifications';

const app = new Hono<Env>();

// 글로벌 미들웨어 등록
app.use('*', requestIdMiddleware);
app.use('*', corsMiddleware);

// 라우트 마운트
app.route('/health', health);
app.route('/api/v1', v1);

// 루트 엔드포인트
app.get('/', (c) => {
  return c.json({
    name: 'PolicyFlow API',
    version: '1.0.0',
    description: '모든 국민이 자신에게 해당하는 정책 자금을 단 1원도 놓치지 않도록 돕는 서비스',
    endpoints: {
      health: '/health',
      api: '/api/v1',
    },
  });
});

// 404 핸들러
app.notFound((c) => {
  return c.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: '요청한 리소스를 찾을 수 없습니다.',
      },
    },
    404
  );
});

// 글로벌 에러 핸들러
app.onError(errorHandler);

export default {
  fetch: app.fetch,
  async scheduled(
    event: ScheduledEvent,
    env: Env['Bindings'],
    ctx: ExecutionContext
  ): Promise<void> {
    await handleScheduled(env, ctx);
  },
};
