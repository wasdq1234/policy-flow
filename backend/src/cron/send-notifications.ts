/**
 * Cron Trigger: 마감 임박 알림 발송
 * 매일 오전 9시 실행
 */
import type { ExecutionContext } from '@cloudflare/workers-types';
import type { Env } from '../types/env';
import { sendClosingSoonNotifications } from '../services/notification.service';

/**
 * Cron Trigger 핸들러
 */
export async function handleScheduled(
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  console.log('[Cron] Starting scheduled notification job...');

  try {
    const result = await sendClosingSoonNotifications(env.DB);

    console.log(
      `[Cron] Notification job completed. Sent: ${result.sent}, Failed: ${result.failed}`
    );
  } catch (error) {
    console.error('[Cron] Notification job failed:', error);
    throw error;
  }
}
