/**
 * 인증 API 테스트 (TDD RED)
 * Phase 1, T1.1 - 인증 API (소셜 로그인)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testRequest, createMockEnv } from '../utils/test-helpers';

describe('Auth API', () => {
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = createMockEnv();
    // Mock 환경 변수 추가
    mockEnv.JWT_SECRET = 'test-secret-key-for-jwt';
    mockEnv.JWT_ACCESS_EXPIRY = '3600'; // 1시간
    mockEnv.JWT_REFRESH_EXPIRY = '604800'; // 7일
  });

  describe('POST /api/v1/auth/login', () => {
    it.skip('should login with valid Google token', async () => {
      const response = await testRequest('POST', '/api/v1/auth/login', {
        body: {
          provider: 'google',
          token: 'valid-google-token',
        },
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toBeDefined();
      expect(json.data.accessToken).toBeDefined();
      expect(json.data.refreshToken).toBeDefined();
      expect(json.data.expiresIn).toBe(3600);
      expect(json.data.user).toBeDefined();
      expect(json.data.user.id).toBeDefined();
      expect(json.data.user.email).toBeDefined();
      expect(json.data.user.nickname).toBeDefined();
    });

    it.skip('should login with valid Kakao token', async () => {
      const response = await testRequest('POST', '/api/v1/auth/login', {
        body: {
          provider: 'kakao',
          token: 'valid-kakao-token',
        },
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toBeDefined();
      expect(json.data.accessToken).toBeDefined();
      expect(json.data.refreshToken).toBeDefined();
      expect(json.data.expiresIn).toBe(3600);
      expect(json.data.user).toBeDefined();
    });

    it('should return 401 for invalid token', async () => {
      const response = await testRequest('POST', '/api/v1/auth/login', {
        body: {
          provider: 'google',
          token: 'invalid-token',
        },
        env: mockEnv,
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it.skip('should create new user on first login', async () => {
      const response = await testRequest('POST', '/api/v1/auth/login', {
        body: {
          provider: 'google',
          token: 'new-user-google-token',
        },
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data.user.id).toBeDefined();
      expect(json.data.user.createdAt).toBeDefined();
    });

    it.skip('should return existing user on subsequent login', async () => {
      // 첫 번째 로그인
      const firstResponse = await testRequest('POST', '/api/v1/auth/login', {
        body: {
          provider: 'google',
          token: 'existing-user-token',
        },
        env: mockEnv,
      });
      const firstJson = await firstResponse.json();
      console.log('First login response:', JSON.stringify(firstJson, null, 2), 'Status:', firstResponse.status);

      if (!firstJson.data) {
        throw new Error(`Login failed: ${JSON.stringify(firstJson)}`);
      }

      const firstUserId = firstJson.data.user.id;

      // 두 번째 로그인 (같은 토큰)
      const secondResponse = await testRequest('POST', '/api/v1/auth/login', {
        body: {
          provider: 'google',
          token: 'existing-user-token',
        },
        env: mockEnv,
      });
      const secondJson = await secondResponse.json();
      const secondUserId = secondJson.data.user.id;

      // 같은 사용자여야 함
      expect(firstUserId).toBe(secondUserId);
    });

    it('should return 400 for missing provider', async () => {
      const response = await testRequest('POST', '/api/v1/auth/login', {
        body: {
          token: 'some-token',
        },
        env: mockEnv,
      });

      const json = await response.json();
      console.log('Missing provider response:', JSON.stringify(json, null, 2));

      expect(response.status).toBe(400);
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing token', async () => {
      const response = await testRequest('POST', '/api/v1/auth/login', {
        body: {
          provider: 'google',
        },
        env: mockEnv,
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid provider', async () => {
      const response = await testRequest('POST', '/api/v1/auth/login', {
        body: {
          provider: 'facebook',
          token: 'some-token',
        },
        env: mockEnv,
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it.skip('should return new access token with valid refresh token', async () => {
      // 먼저 로그인하여 리프레시 토큰 획득
      const loginResponse = await testRequest('POST', '/api/v1/auth/login', {
        body: {
          provider: 'google',
          token: 'valid-google-token',
        },
        env: mockEnv,
      });
      const loginJson = await loginResponse.json();
      const refreshToken = loginJson.data.refreshToken;

      // 리프레시 토큰으로 새 액세스 토큰 발급
      const response = await testRequest('POST', '/api/v1/auth/refresh', {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toBeDefined();
      expect(json.data.accessToken).toBeDefined();
      expect(json.data.expiresIn).toBe(3600);
    });

    it('should return 401 for expired refresh token', async () => {
      const response = await testRequest('POST', '/api/v1/auth/refresh', {
        headers: {
          Authorization: 'Bearer expired-refresh-token',
        },
        env: mockEnv,
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await testRequest('POST', '/api/v1/auth/refresh', {
        headers: {
          Authorization: 'Bearer invalid-refresh-token',
        },
        env: mockEnv,
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 without auth header', async () => {
      const response = await testRequest('POST', '/api/v1/auth/refresh', {
        env: mockEnv,
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('DELETE /api/v1/auth/logout', () => {
    it.skip('should invalidate refresh token', async () => {
      // 로그인
      const loginResponse = await testRequest('POST', '/api/v1/auth/login', {
        body: {
          provider: 'google',
          token: 'valid-google-token',
        },
        env: mockEnv,
      });
      const loginJson = await loginResponse.json();
      const accessToken = loginJson.data.accessToken;
      const refreshToken = loginJson.data.refreshToken;

      // 로그아웃
      const logoutResponse = await testRequest('DELETE', '/api/v1/auth/logout', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        env: mockEnv,
      });

      expect(logoutResponse.status).toBe(204);

      // 로그아웃 후 리프레시 토큰 사용 시도 (실패해야 함)
      const refreshResponse = await testRequest('POST', '/api/v1/auth/refresh', {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
        env: mockEnv,
      });

      expect(refreshResponse.status).toBe(401);
    });

    it('should return 401 without auth header', async () => {
      const response = await testRequest('DELETE', '/api/v1/auth/logout', {
        env: mockEnv,
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 with invalid token', async () => {
      const response = await testRequest('DELETE', '/api/v1/auth/logout', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
        env: mockEnv,
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('UNAUTHORIZED');
    });
  });
});
