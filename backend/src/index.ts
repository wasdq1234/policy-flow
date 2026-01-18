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
import { handleScheduled as handleNotificationCron } from './cron/send-notifications';
import { syncYouthCenterPolicies } from './cron/sync-youth-center';

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
    const scheduledTime = new Date(event.scheduledTime);
    const hour = scheduledTime.getUTCHours();

    console.log(`[Cron] Scheduled event triggered at ${scheduledTime.toISOString()} (UTC hour: ${hour})`);

    // 매일 오전 9시 KST (UTC 0시) - 마감 임박 알림 발송
    if (hour === 0) {
      console.log('[Cron] Running notification job...');
      await handleNotificationCron(env, ctx);
    }

    // 6시간마다 - 청년센터 API 데이터 동기화
    if (hour % 6 === 0) {
      console.log('[Cron] Running youth center sync job...');
      try {
        const result = await syncYouthCenterPolicies({ DB: env.DB, YOUTH_CENTER_API_KEY: env.YOUTH_CENTER_API_KEY });
        console.log(`[Cron] Sync completed: ${result.inserted} inserted, ${result.updated} updated, ${result.errors} errors`);
      } catch (error) {
        console.error('[Cron] Sync job failed:', error);
      }
    }
  },
};
