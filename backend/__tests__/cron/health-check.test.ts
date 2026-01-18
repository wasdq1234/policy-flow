/**
 * Health Check Worker 테스트 (TDD RED)
 * Phase 5, T5.3 - Health Check Worker
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createMockEnv } from '../utils/test-helpers';
import {
  checkYouthCenterApiHealth,
  sendHealthCheckAlert,
  runHealthCheck,
  resetFailureCounter,
  type HealthCheckResult,
} from '@/cron/health-check';

describe('Health Check Worker', () => {
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = createMockEnv();

    // 환경 변수 설정
    mockEnv.YOUTH_CENTER_API_KEY = 'test-api-key';
    mockEnv.HEALTH_CHECK_WEBHOOK_URL = 'https://hooks.slack.com/test/webhook';
    mockEnv.HEALTH_CHECK_FAILURE_THRESHOLD = 3;

    // fetch mock 리셋
    vi.clearAllMocks();

    // 실패 카운터 리셋
    resetFailureCounter();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkYouthCenterApiHealth', () => {
    it('should return healthy status when API responds successfully', async () => {
      // Mock successful API response
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          pageIndex: 1,
          totalCnt: 100,
          youthPolicyList: [{ bizId: 'TEST001', polyBizSjnm: 'Test Policy' }],
        }),
      });

      const result = await checkYouthCenterApiHealth('test-api-key');

      expect(result.isHealthy).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.error).toBeUndefined();
    });

    it('should return unhealthy status when API returns 4xx error', async () => {
      // Mock 401 Unauthorized
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const result = await checkYouthCenterApiHealth('invalid-api-key');

      expect(result.isHealthy).toBe(false);
      expect(result.statusCode).toBe(401);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('401');
    });

    it('should return unhealthy status when API returns 5xx error', async () => {
      // Mock 503 Service Unavailable
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      const result = await checkYouthCenterApiHealth('test-api-key');

      expect(result.isHealthy).toBe(false);
      expect(result.statusCode).toBe(503);
      expect(result.error).toContain('503');
    });

    it('should return unhealthy status when network error occurs', async () => {
      // Mock network error
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network timeout'));

      const result = await checkYouthCenterApiHealth('test-api-key');

      expect(result.isHealthy).toBe(false);
      expect(result.statusCode).toBe(0);
      expect(result.error).toContain('Network timeout');
    });

    it('should return unhealthy status when response is invalid JSON', async () => {
      // Mock invalid JSON response
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const result = await checkYouthCenterApiHealth('test-api-key');

      expect(result.isHealthy).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });

    it('should measure response time accurately', async () => {
      // Mock delayed response (100ms)
      global.fetch = vi.fn().mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                status: 200,
                statusText: 'OK',
                json: async () => ({ pageIndex: 1, totalCnt: 0, youthPolicyList: [] }),
              });
            }, 100);
          })
      );

      const result = await checkYouthCenterApiHealth('test-api-key');

      expect(result.isHealthy).toBe(true);
      expect(result.responseTime).toBeGreaterThanOrEqual(100);
      expect(result.responseTime).toBeLessThan(200); // 100-200ms range
    });

    it('should use correct API endpoint and parameters', async () => {
      const fetchSpy = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ pageIndex: 1, totalCnt: 0, youthPolicyList: [] }),
      });
      global.fetch = fetchSpy;

      await checkYouthCenterApiHealth('my-api-key-123');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const callUrl = fetchSpy.mock.calls[0][0];
      expect(callUrl).toContain('youthcenter.go.kr');
      expect(callUrl).toContain('openApiVlak=my-api-key-123');
      expect(callUrl).toContain('pageIndex=1');
      expect(callUrl).toContain('display=1');
    });
  });

  describe('sendHealthCheckAlert', () => {
    it('should send alert to webhook when failure threshold exceeded', async () => {
      const fetchSpy = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
      });
      global.fetch = fetchSpy;

      const healthResult: HealthCheckResult = {
        isHealthy: false,
        statusCode: 503,
        responseTime: 0,
        error: 'Service Unavailable',
        timestamp: new Date(),
      };

      await sendHealthCheckAlert('https://hooks.slack.com/test', healthResult, 3);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy.mock.calls[0][0]).toBe('https://hooks.slack.com/test');
      expect(fetchSpy.mock.calls[0][1].method).toBe('POST');

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.text || body.content).toBeDefined();
      expect(JSON.stringify(body)).toContain('Health Check Alert');
      expect(JSON.stringify(body)).toContain('503');
    });

    it('should include failure count in alert message', async () => {
      const fetchSpy = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
      });
      global.fetch = fetchSpy;

      const healthResult: HealthCheckResult = {
        isHealthy: false,
        statusCode: 0,
        responseTime: 0,
        error: 'Network timeout',
        timestamp: new Date(),
      };

      await sendHealthCheckAlert('https://hooks.slack.com/test', healthResult, 5);

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(JSON.stringify(body)).toContain('5');
    });

    it('should handle webhook failure gracefully', async () => {
      const fetchSpy = vi.fn().mockRejectedValueOnce(new Error('Webhook error'));
      global.fetch = fetchSpy;

      const healthResult: HealthCheckResult = {
        isHealthy: false,
        statusCode: 500,
        responseTime: 0,
        error: 'Internal Server Error',
        timestamp: new Date(),
      };

      // Should not throw error
      await expect(
        sendHealthCheckAlert('https://hooks.slack.com/test', healthResult, 3)
      ).resolves.not.toThrow();
    });

    it('should format Slack message correctly', async () => {
      const fetchSpy = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
      });
      global.fetch = fetchSpy;

      const healthResult: HealthCheckResult = {
        isHealthy: false,
        statusCode: 401,
        responseTime: 150,
        error: 'Unauthorized API Key',
        timestamp: new Date('2026-01-18T10:30:00Z'),
      };

      await sendHealthCheckAlert('https://hooks.slack.com/test', healthResult, 3);

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);

      // Slack 형식 확인
      expect(body.text || body.blocks).toBeDefined();
      expect(JSON.stringify(body)).toContain('Health Check Alert');
      expect(JSON.stringify(body)).toContain('401');
      expect(JSON.stringify(body)).toContain('Unauthorized API Key');
    });
  });

  describe('runHealthCheck', () => {
    it('should return success when API is healthy', async () => {
      // Mock healthy API
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ pageIndex: 1, totalCnt: 0, youthPolicyList: [] }),
      });

      const result = await runHealthCheck(mockEnv);

      expect(result.success).toBe(true);
      expect(result.isHealthy).toBe(true);
      expect(result.consecutiveFailures).toBe(0);
      expect(result.alertSent).toBe(false);
    });

    it('should track consecutive failures', async () => {
      // Mock unhealthy API
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      // First failure
      const result1 = await runHealthCheck(mockEnv);
      expect(result1.consecutiveFailures).toBe(1);
      expect(result1.alertSent).toBe(false);

      // Second failure
      const result2 = await runHealthCheck(mockEnv);
      expect(result2.consecutiveFailures).toBe(2);
      expect(result2.alertSent).toBe(false);

      // Third failure - should trigger alert
      const result3 = await runHealthCheck(mockEnv);
      expect(result3.consecutiveFailures).toBe(3);
      expect(result3.alertSent).toBe(true);
    });

    it('should send alert when threshold exceeded', async () => {
      // Mock 3 health check failures and 1 webhook alert
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      await runHealthCheck(mockEnv);
      await runHealthCheck(mockEnv);
      const result = await runHealthCheck(mockEnv);

      expect(result.alertSent).toBe(true);
      // Health check가 3번, webhook이 1번 총 4번 호출되어야 함
    });

    it('should reset counter when API recovers', async () => {
      // Mock: failure -> failure -> success
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => ({ pageIndex: 1, totalCnt: 0, youthPolicyList: [] }),
        });

      const result1 = await runHealthCheck(mockEnv);
      expect(result1.consecutiveFailures).toBe(1);

      const result2 = await runHealthCheck(mockEnv);
      expect(result2.consecutiveFailures).toBe(2);

      const result3 = await runHealthCheck(mockEnv);
      expect(result3.consecutiveFailures).toBe(0);
      expect(result3.isHealthy).toBe(true);
    });

    it('should handle missing YOUTH_CENTER_API_KEY', async () => {
      mockEnv.YOUTH_CENTER_API_KEY = undefined;

      const result = await runHealthCheck(mockEnv);

      expect(result.success).toBe(false);
      expect(result.error).toContain('YOUTH_CENTER_API_KEY');
    });

    it('should work without HEALTH_CHECK_WEBHOOK_URL', async () => {
      mockEnv.HEALTH_CHECK_WEBHOOK_URL = undefined;

      // Mock unhealthy API (3 consecutive failures)
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
      });

      await runHealthCheck(mockEnv);
      await runHealthCheck(mockEnv);
      const result = await runHealthCheck(mockEnv);

      // Should not crash, but alert not sent
      expect(result.consecutiveFailures).toBe(3);
      expect(result.alertSent).toBe(false);
      expect(result.success).toBe(true); // Health check itself succeeded
    });

    it('should use custom failure threshold', async () => {
      mockEnv.HEALTH_CHECK_FAILURE_THRESHOLD = 5;

      // 5번 실패 + 마지막 webhook 호출
      global.fetch = vi.fn()
        .mockResolvedValue({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: true, status: 200 }); // webhook

      let result;
      for (let i = 0; i < 5; i++) {
        result = await runHealthCheck(mockEnv);
      }

      expect(result.consecutiveFailures).toBe(5);
      expect(result.alertSent).toBe(true);
    });

    it('should store health check result in D1', async () => {
      // Mock healthy API
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => ({ pageIndex: 1, totalCnt: 0, youthPolicyList: [] }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 0,
          statusText: '',
        });

      await runHealthCheck(mockEnv);

      // D1에 health_checks 테이블이 없으므로 에러 없이 동작해야 함
      // (옵션 기능이므로 실패해도 전체 프로세스는 성공)
      const result = await runHealthCheck(mockEnv);
      expect(result.success).toBe(true);
    });
  });

  describe('Integration Test', () => {
    it('should complete full health check cycle', async () => {
      // Scenario: 3 failures -> alert -> recovery
      global.fetch = vi.fn()
        // Failure 1
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        // Failure 2
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        // Failure 3
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        // Alert webhook
        .mockResolvedValueOnce({ ok: true, status: 200 })
        // Recovery
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => ({ pageIndex: 1, totalCnt: 0, youthPolicyList: [] }),
        });

      // Failure 1
      const r1 = await runHealthCheck(mockEnv);
      expect(r1.consecutiveFailures).toBe(1);
      expect(r1.alertSent).toBe(false);

      // Failure 2
      const r2 = await runHealthCheck(mockEnv);
      expect(r2.consecutiveFailures).toBe(2);
      expect(r2.alertSent).toBe(false);

      // Failure 3 -> Alert
      const r3 = await runHealthCheck(mockEnv);
      expect(r3.consecutiveFailures).toBe(3);
      expect(r3.alertSent).toBe(true);

      // Recovery
      const r4 = await runHealthCheck(mockEnv);
      expect(r4.isHealthy).toBe(true);
      expect(r4.consecutiveFailures).toBe(0);
    });
  });
});
