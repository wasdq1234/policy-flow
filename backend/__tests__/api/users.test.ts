/**
 * 사용자 API 테스트 (TDD RED)
 * Phase 1, T1.2 - 사용자 API (프로필/설정)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { testRequest, createMockEnv } from '../utils/test-helpers';
import { generateAccessToken } from '../../src/utils/jwt';

describe('Users API', () => {
  let mockEnv: any;
  let validToken: string;
  let testUserId: string;

  beforeEach(async () => {
    mockEnv = createMockEnv();
    mockEnv.JWT_SECRET = 'test-secret-key-for-jwt';
    mockEnv.JWT_ACCESS_EXPIRY = '3600';

    // 테스트용 유저 ID 및 토큰 생성
    testUserId = 'test-user-123';
    validToken = generateAccessToken(testUserId, 'test@example.com', mockEnv.JWT_SECRET);

    // Mock DB 초기화 (각 테스트마다 깨끗한 상태)
    const mockDb = mockEnv.DB as any;
    mockDb.data.clear();
    mockDb.data.set('users', []);
    mockDb.data.set('auth_tokens', []);
    mockDb.data.set('policies', []);
    mockDb.data.set('bookmarks', []);
    mockDb.data.set('posts', []);
    mockDb.data.set('comments', []);

    // 테스트 사용자 추가
    const usersTable = mockDb.data.get('users');
    usersTable.push({
      id: testUserId,
      email: 'test@example.com',
      provider: 'google',
      providerId: 'google-test-123',
      nickname: '테스트 사용자',
      profileImage: null,
      preferences: null,
      fcmToken: null,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should return current user profile', async () => {
      const response = await testRequest('GET', '/api/v1/users/me', {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toBeDefined();
      expect(json.data.id).toBe(testUserId);
      expect(json.data.email).toBeDefined();
      expect(json.data.nickname).toBeDefined();
      expect(json.data.createdAt).toBeDefined();
      expect(json.data).toHaveProperty('preferences');
      expect(json.data).toHaveProperty('profileImage');
    });

    it('should return 401 without auth', async () => {
      const response = await testRequest('GET', '/api/v1/users/me', {
        env: mockEnv,
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 with invalid token', async () => {
      const response = await testRequest('GET', '/api/v1/users/me', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
        env: mockEnv,
      });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/users/me/preferences', () => {
    it('should update user preferences', async () => {
      const preferences = {
        regions: ['SEOUL', 'GYEONGGI'],
        categories: ['JOB', 'HOUSING'],
        ageRange: { min: 20, max: 35 },
        notifyBeforeDays: [7, 3, 1],
      };

      const response = await testRequest('PUT', '/api/v1/users/me/preferences', {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
        body: preferences,
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toBeDefined();
      expect(json.data.preferences).toBeDefined();
      expect(json.data.preferences.regions).toEqual(preferences.regions);
      expect(json.data.preferences.categories).toEqual(preferences.categories);
      expect(json.data.preferences.ageRange).toEqual(preferences.ageRange);
      expect(json.data.preferences.notifyBeforeDays).toEqual(preferences.notifyBeforeDays);
      expect(json.data.updatedAt).toBeDefined();
    });

    it('should validate preferences schema', async () => {
      const invalidPreferences = {
        regions: ['INVALID_REGION'],
        categories: ['INVALID_CATEGORY'],
        ageRange: { min: -10, max: 200 },
        notifyBeforeDays: [-1, 0],
      };

      const response = await testRequest('PUT', '/api/v1/users/me/preferences', {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
        body: invalidPreferences,
        env: mockEnv,
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should allow partial updates', async () => {
      const partialPreferences = {
        regions: ['BUSAN'],
      };

      const response = await testRequest('PUT', '/api/v1/users/me/preferences', {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
        body: partialPreferences,
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data.preferences.regions).toEqual(['BUSAN']);
    });

    it('should return 401 without auth', async () => {
      const response = await testRequest('PUT', '/api/v1/users/me/preferences', {
        body: {
          regions: ['SEOUL'],
        },
        env: mockEnv,
      });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/users/me/push-token', () => {
    it('should register FCM token', async () => {
      const response = await testRequest('POST', '/api/v1/users/me/push-token', {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
        body: {
          fcmToken: 'test-fcm-token-12345',
        },
        env: mockEnv,
      });

      expect(response.status).toBe(204);
    });

    it('should validate FCM token', async () => {
      const response = await testRequest('POST', '/api/v1/users/me/push-token', {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
        body: {
          fcmToken: '',
        },
        env: mockEnv,
      });

      const json = await response.json();
      expect(response.status).toBe(400);
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 401 without auth', async () => {
      const response = await testRequest('POST', '/api/v1/users/me/push-token', {
        body: {
          fcmToken: 'test-token',
        },
        env: mockEnv,
      });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/users/me', () => {
    it('should delete user account', async () => {
      const response = await testRequest('DELETE', '/api/v1/users/me', {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
        env: mockEnv,
      });

      expect(response.status).toBe(204);
    });

    it('should return 401 without auth', async () => {
      const response = await testRequest('DELETE', '/api/v1/users/me', {
        env: mockEnv,
      });

      expect(response.status).toBe(401);
    });

    it('should cascade delete user data', async () => {
      // 1. 사용자 삭제
      const deleteResponse = await testRequest('DELETE', '/api/v1/users/me', {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
        env: mockEnv,
      });

      expect(deleteResponse.status).toBe(204);

      // 2. 삭제 후 프로필 조회 시도
      const getResponse = await testRequest('GET', '/api/v1/users/me', {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
        env: mockEnv,
      });

      // JWT는 유효하지만 DB에서 사용자가 삭제되었으므로 404 또는 401
      expect([401, 404]).toContain(getResponse.status);
    });
  });
});
