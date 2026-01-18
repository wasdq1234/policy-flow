/**
 * Cron Trigger: Health Check Worker
 * 청년센터 API 상태 체크 및 연속 실패 시 알림 발송
 */
import type { D1Database } from '@cloudflare/workers-types';

/**
 * Health Check 결과
 */
export interface HealthCheckResult {
  isHealthy: boolean;
  statusCode: number;
  responseTime: number;
  error?: string;
  timestamp: Date;
}

/**
 * Health Check 실행 결과
 */
export interface HealthCheckRunResult {
  success: boolean;
  isHealthy: boolean;
  consecutiveFailures: number;
  alertSent: boolean;
  error?: string;
}

/**
 * 환경 변수
 */
export interface HealthCheckEnv {
  DB?: D1Database;
  YOUTH_CENTER_API_KEY?: string;
  HEALTH_CHECK_WEBHOOK_URL?: string;
  HEALTH_CHECK_FAILURE_THRESHOLD?: number;
}

// 메모리 내 실패 카운터 (간단한 구현)
// 실제 운영에서는 KV Store나 D1을 사용 권장
let consecutiveFailureCount = 0;

/**
 * 실패 카운터 리셋 (테스트용)
 */
export function resetFailureCounter(): void {
  consecutiveFailureCount = 0;
}

/**
 * 청년센터 API Health Check
 * @param apiKey - 청년센터 API 키
 * @returns Health Check 결과
 */
export async function checkYouthCenterApiHealth(
  apiKey: string
): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const timestamp = new Date();

  try {
    // 청년센터 API에 최소 요청 (1개만 조회)
    const url = new URL('https://www.youthcenter.go.kr/opi/youthPlcyList.do');
    url.searchParams.set('openApiVlak', apiKey);
    url.searchParams.set('pageIndex', '1');
    url.searchParams.set('display', '1');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        isHealthy: false,
        statusCode: response.status,
        responseTime,
        error: `청년센터 API 호출 실패: ${response.status} ${response.statusText}`,
        timestamp,
      };
    }

    // JSON 파싱 확인
    try {
      await response.json();
    } catch (jsonError) {
      return {
        isHealthy: false,
        statusCode: response.status,
        responseTime,
        error: `JSON 파싱 실패: ${jsonError instanceof Error ? jsonError.message : '알 수 없는 오류'}`,
        timestamp,
      };
    }

    return {
      isHealthy: true,
      statusCode: response.status,
      responseTime,
      timestamp,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      isHealthy: false,
      statusCode: 0,
      responseTime,
      error: `네트워크 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      timestamp,
    };
  }
}

/**
 * Health Check 알림 발송 (Slack/Telegram Webhook)
 * @param webhookUrl - Webhook URL
 * @param healthResult - Health Check 결과
 * @param failureCount - 연속 실패 횟수
 */
export async function sendHealthCheckAlert(
  webhookUrl: string,
  healthResult: HealthCheckResult,
  failureCount: number
): Promise<void> {
  try {
    const message = {
      text: `🚨 *Health Check Alert*\n\n` +
        `청년센터 API가 ${failureCount}회 연속 실패했습니다.\n\n` +
        `• Status Code: ${healthResult.statusCode}\n` +
        `• Error: ${healthResult.error || 'N/A'}\n` +
        `• Response Time: ${healthResult.responseTime}ms\n` +
        `• Timestamp: ${healthResult.timestamp.toISOString()}\n\n` +
        `조치가 필요합니다.`,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error(
        `[Health Check] Webhook 발송 실패: ${response.status} ${response.statusText}`
      );
    } else {
      console.log('[Health Check] Alert sent successfully');
    }
  } catch (error) {
    console.error('[Health Check] Webhook 발송 중 오류:', error);
  }
}

/**
 * Health Check 실행
 * @param env - Cloudflare Workers 환경 변수
 * @returns Health Check 실행 결과
 */
export async function runHealthCheck(
  env: HealthCheckEnv
): Promise<HealthCheckRunResult> {
  const apiKey = env.YOUTH_CENTER_API_KEY;

  if (!apiKey) {
    console.error('[Health Check] YOUTH_CENTER_API_KEY가 설정되지 않았습니다.');
    return {
      success: false,
      isHealthy: false,
      consecutiveFailures: 0,
      alertSent: false,
      error: 'YOUTH_CENTER_API_KEY가 설정되지 않았습니다.',
    };
  }

  const webhookUrl = env.HEALTH_CHECK_WEBHOOK_URL;
  const failureThreshold = env.HEALTH_CHECK_FAILURE_THRESHOLD || 3;

  console.log('[Health Check] Starting health check...');

  // Health Check 실행
  const healthResult = await checkYouthCenterApiHealth(apiKey);

  console.log(
    `[Health Check] Result: ${healthResult.isHealthy ? 'Healthy' : 'Unhealthy'} ` +
      `(Status: ${healthResult.statusCode}, Response Time: ${healthResult.responseTime}ms)`
  );

  // 실패 카운터 업데이트
  if (!healthResult.isHealthy) {
    consecutiveFailureCount++;
    console.log(`[Health Check] Consecutive failures: ${consecutiveFailureCount}`);
  } else {
    if (consecutiveFailureCount > 0) {
      console.log('[Health Check] API recovered. Resetting failure counter.');
    }
    consecutiveFailureCount = 0;
  }

  // 알림 발송 여부 결정
  let alertSent = false;
  if (consecutiveFailureCount >= failureThreshold && webhookUrl) {
    console.log(
      `[Health Check] Failure threshold (${failureThreshold}) exceeded. Sending alert...`
    );
    await sendHealthCheckAlert(webhookUrl, healthResult, consecutiveFailureCount);
    alertSent = true;
  }

  // D1에 Health Check 결과 저장 (옵션)
  if (env.DB) {
    try {
      await env.DB.prepare(`
        INSERT INTO health_checks (
          source, is_healthy, status_code, response_time, error, checked_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `)
        .bind(
          'youth_center',
          healthResult.isHealthy ? 1 : 0,
          healthResult.statusCode,
          healthResult.responseTime,
          healthResult.error || null,
          Math.floor(healthResult.timestamp.getTime() / 1000)
        )
        .run();

      console.log('[Health Check] Result saved to D1');
    } catch (dbError) {
      // D1 저장 실패는 무시 (옵션 기능)
      console.warn('[Health Check] D1 저장 실패 (테이블이 없을 수 있음):', dbError);
    }
  }

  return {
    success: true,
    isHealthy: healthResult.isHealthy,
    consecutiveFailures: consecutiveFailureCount,
    alertSent,
  };
}
