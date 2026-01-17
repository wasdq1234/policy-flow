/**
 * Health Check API 테스트
 */
import { describe, it, expect } from 'vitest';
import { testRequest, createMockEnv } from '../utils/test-helpers';

describe('Health Check API', () => {
  describe('GET /health', () => {
    it('should return ok status', async () => {
      const res = await testRequest('GET', '/health', {
        env: {
          ...createMockEnv(),
          ENVIRONMENT: 'test',
        },
      });

      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json).toHaveProperty('status', 'ok');
      expect(json).toHaveProperty('environment', 'test');
      expect(json).toHaveProperty('timestamp');
      expect(typeof json.timestamp).toBe('string');
    });

    it('should return ISO 8601 timestamp', async () => {
      const res = await testRequest('GET', '/health');

      const json = await res.json();
      const timestamp = json.timestamp;

      // ISO 8601 형식 검증
      expect(() => new Date(timestamp)).not.toThrow();
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });

  describe('GET /health/db', () => {
    it('should return database connection status', async () => {
      const res = await testRequest('GET', '/health/db');

      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json).toHaveProperty('status', 'ok');
      expect(json).toHaveProperty('database', 'connected');
      expect(json).toHaveProperty('timestamp');
    });

    it('should handle database connection errors', async () => {
      // DB가 에러를 던지도록 설정
      const mockEnv = {
        DB: {
          prepare: () => ({
            first: async () => {
              throw new Error('Database connection failed');
            },
          }),
        },
      };

      const res = await testRequest('GET', '/health/db', {
        env: mockEnv,
      });

      expect(res.status).toBe(503);

      const json = await res.json();
      expect(json).toHaveProperty('status', 'error');
      expect(json).toHaveProperty('database', 'disconnected');
      expect(json).toHaveProperty('error');
      expect(json.error).toBe('Database connection failed');
    });
  });
});
