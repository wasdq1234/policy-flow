/**
 * 북마크 API 테스트 (TDD RED)
 * Phase 3, T3.1 - 북마크 API
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { testRequest, createMockEnv } from '../utils/test-helpers';
import { generateAccessToken } from '@/utils/jwt';

describe('Bookmarks API', () => {
  let mockEnv: any;
  let accessToken: string;
  const testUserId = 'user-001';

  beforeEach(() => {
    mockEnv = createMockEnv();

    // 북마크 초기화 (테스트마다 깨끗한 상태 보장)
    mockEnv.DB.data.set('bookmarks', []);

    // 테스트용 사용자 생성
    mockEnv.DB.data.set('users', [
      {
        id: testUserId,
        email: 'test@example.com',
        provider: 'google',
        provider_id: 'google-123',
        nickname: '테스트 사용자',
        profile_image: null,
        preferences: null,
        fcm_token: null,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
      },
    ]);

    // 테스트용 정책 데이터 추가
    const now = Math.floor(Date.now() / 1000);
    const oneDaySeconds = 86400;

    mockEnv.DB.data.set('policies', [
      {
        id: 'POL001',
        title: '청년 일자리 지원 사업',
        summary: '만 18세~34세 청년 대상 취업 지원',
        category: 'JOB',
        region: 'SEOUL',
        target_age_min: 18,
        target_age_max: 34,
        start_date: now - 30 * oneDaySeconds,
        end_date: now + 30 * oneDaySeconds,
        is_always_open: 0,
        apply_url: 'https://example.com/apply/POL001',
        detail_json: null,
        created_at: now - 60 * oneDaySeconds,
        updated_at: now - 60 * oneDaySeconds,
      },
      {
        id: 'POL002',
        title: '주거 안정 월세 지원',
        summary: '청년 1인 가구 월세 지원 정책',
        category: 'HOUSING',
        region: 'SEOUL',
        target_age_min: 19,
        target_age_max: 39,
        start_date: now - 60 * oneDaySeconds,
        end_date: now + 5 * oneDaySeconds,
        is_always_open: 0,
        apply_url: 'https://example.com/apply/POL002',
        detail_json: null,
        created_at: now - 90 * oneDaySeconds,
        updated_at: now - 90 * oneDaySeconds,
      },
      {
        id: 'POL003',
        title: '전국 대학생 학자금 대출',
        summary: '저금리 학자금 대출 프로그램',
        category: 'LOAN',
        region: 'ALL',
        target_age_min: null,
        target_age_max: null,
        start_date: null,
        end_date: null,
        is_always_open: 1,
        apply_url: 'https://example.com/apply/POL003',
        detail_json: null,
        created_at: now - 120 * oneDaySeconds,
        updated_at: now - 120 * oneDaySeconds,
      },
    ]);

    // Access Token 생성 (JWT)
    accessToken = generateAccessToken(
      testUserId,
      'test@example.com',
      mockEnv.JWT_SECRET,
      parseInt(mockEnv.JWT_ACCESS_EXPIRY)
    );
  });

  describe('GET /api/v1/bookmarks', () => {
    it('should return empty list when no bookmarks', async () => {
      const response = await testRequest('GET', '/api/v1/bookmarks', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBe(0);
      expect(json.meta).toBeDefined();
      expect(json.meta.page).toBe(1);
      expect(json.meta.limit).toBe(20);
      expect(json.meta.total).toBe(0);
      expect(json.meta.hasNext).toBe(false);
    });

    it('should return bookmarked policies list', async () => {
      const now = Math.floor(Date.now() / 1000);

      // 북마크 추가
      mockEnv.DB.data.set('bookmarks', [
        {
          user_id: testUserId,
          policy_id: 'POL001',
          notify_before_days: 3,
          created_at: now - 10,
        },
        {
          user_id: testUserId,
          policy_id: 'POL002',
          notify_before_days: 7,
          created_at: now - 5,
        },
      ]);

      const response = await testRequest('GET', '/api/v1/bookmarks', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.data.length).toBe(2);

      // 첫 번째 북마크 검증
      const firstBookmark = json.data[0];
      expect(firstBookmark.policyId).toBeDefined();
      expect(firstBookmark.policy).toBeDefined();
      expect(firstBookmark.policy.id).toBeDefined();
      expect(firstBookmark.policy.title).toBeDefined();
      expect(firstBookmark.policy.category).toBeDefined();
      expect(firstBookmark.policy.region).toBeDefined();
      expect(firstBookmark.notifyBeforeDays).toBeGreaterThan(0);
      expect(firstBookmark.createdAt).toBeGreaterThan(0);

      // 메타데이터 검증
      expect(json.meta.total).toBe(2);
      expect(json.meta.hasNext).toBe(false);
    });

    it('should return bookmarks with pagination', async () => {
      const now = Math.floor(Date.now() / 1000);

      // 3개의 북마크 추가
      mockEnv.DB.data.set('bookmarks', [
        {
          user_id: testUserId,
          policy_id: 'POL001',
          notify_before_days: 3,
          created_at: now - 30,
        },
        {
          user_id: testUserId,
          policy_id: 'POL002',
          notify_before_days: 7,
          created_at: now - 20,
        },
        {
          user_id: testUserId,
          policy_id: 'POL003',
          notify_before_days: 5,
          created_at: now - 10,
        },
      ]);

      const response = await testRequest('GET', '/api/v1/bookmarks?page=1&limit=2', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data.length).toBe(2);
      expect(json.meta.page).toBe(1);
      expect(json.meta.limit).toBe(2);
      expect(json.meta.total).toBe(3);
      expect(json.meta.hasNext).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await testRequest('GET', '/api/v1/bookmarks', {
        env: mockEnv,
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 with invalid token', async () => {
      const response = await testRequest('GET', '/api/v1/bookmarks', {
        env: mockEnv,
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('should sort bookmarks by createdAt DESC (newest first)', async () => {
      const now = Math.floor(Date.now() / 1000);

      mockEnv.DB.data.set('bookmarks', [
        {
          user_id: testUserId,
          policy_id: 'POL001',
          notify_before_days: 3,
          created_at: now - 100, // 가장 오래됨
        },
        {
          user_id: testUserId,
          policy_id: 'POL002',
          notify_before_days: 7,
          created_at: now - 10, // 가장 최근
        },
        {
          user_id: testUserId,
          policy_id: 'POL003',
          notify_before_days: 5,
          created_at: now - 50, // 중간
        },
      ]);

      const response = await testRequest('GET', '/api/v1/bookmarks', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data.length).toBe(3);
      // 최신순 정렬 확인
      expect(json.data[0].policyId).toBe('POL002'); // 가장 최근
      expect(json.data[1].policyId).toBe('POL003'); // 중간
      expect(json.data[2].policyId).toBe('POL001'); // 가장 오래됨
    });
  });

  describe('POST /api/v1/bookmarks', () => {
    it('should create a bookmark successfully', async () => {
      const response = await testRequest('POST', '/api/v1/bookmarks', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          policyId: 'POL001',
        },
      });

      expect(response.status).toBe(201);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.data.policyId).toBe('POL001');
      expect(json.data.notifyBeforeDays).toBe(3); // 기본값
      expect(json.data.createdAt).toBeGreaterThan(0);

      // DB에 실제로 저장되었는지 확인
      const bookmarks = mockEnv.DB.data.get('bookmarks');
      expect(bookmarks.length).toBe(1);
      expect(bookmarks[0].user_id).toBe(testUserId);
      expect(bookmarks[0].policy_id).toBe('POL001');
    });

    it('should create bookmark with custom notifyBeforeDays', async () => {
      const response = await testRequest('POST', '/api/v1/bookmarks', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          policyId: 'POL002',
          notifyBeforeDays: 7,
        },
      });

      expect(response.status).toBe(201);
      const json = await response.json();

      expect(json.data.policyId).toBe('POL002');
      expect(json.data.notifyBeforeDays).toBe(7);

      // DB 확인
      const bookmarks = mockEnv.DB.data.get('bookmarks');
      expect(bookmarks[0].notify_before_days).toBe(7);
    });

    it('should return 404 when policy does not exist', async () => {
      const response = await testRequest('POST', '/api/v1/bookmarks', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          policyId: 'INVALID_POLICY',
        },
      });

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should handle duplicate bookmark gracefully', async () => {
      // 첫 번째 북마크 생성
      const firstResponse = await testRequest('POST', '/api/v1/bookmarks', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          policyId: 'POL001',
        },
      });

      expect(firstResponse.status).toBe(201);

      // 같은 북마크 다시 생성 시도
      const response = await testRequest('POST', '/api/v1/bookmarks', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          policyId: 'POL001',
        },
      });

      // 201 (기존 데이터 반환) - 멱등성 보장
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.data.policyId).toBe('POL001');

      // 중복 생성되지 않았는지 확인
      const bookmarks = mockEnv.DB.data.get('bookmarks');
      const pol001Bookmarks = bookmarks.filter(
        (b: any) => b.user_id === testUserId && b.policy_id === 'POL001'
      );
      expect(pol001Bookmarks.length).toBe(1);
    });

    it('should return 401 without authentication', async () => {
      const response = await testRequest('POST', '/api/v1/bookmarks', {
        env: mockEnv,
        body: {
          policyId: 'POL001',
        },
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 400 for invalid policyId', async () => {
      const response = await testRequest('POST', '/api/v1/bookmarks', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          policyId: '', // 빈 문자열
        },
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid notifyBeforeDays', async () => {
      const response = await testRequest('POST', '/api/v1/bookmarks', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          policyId: 'POL001',
          notifyBeforeDays: -1, // 음수
        },
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/v1/bookmarks/:policyId', () => {
    it('should delete bookmark successfully', async () => {
      const now = Math.floor(Date.now() / 1000);

      // 북마크 생성
      mockEnv.DB.data.set('bookmarks', [
        {
          user_id: testUserId,
          policy_id: 'POL001',
          notify_before_days: 3,
          created_at: now,
        },
      ]);

      const response = await testRequest('DELETE', '/api/v1/bookmarks/POL001', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(204);

      // DB에서 삭제되었는지 확인
      const bookmarks = mockEnv.DB.data.get('bookmarks');
      expect(bookmarks.length).toBe(0);
    });

    it('should return 404 when bookmark does not exist', async () => {
      const response = await testRequest('DELETE', '/api/v1/bookmarks/POL999', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should only delete own bookmark', async () => {
      const now = Math.floor(Date.now() / 1000);
      const otherUserId = 'user-002';

      // 다른 사용자 생성
      const users = mockEnv.DB.data.get('users');
      users.push({
        id: otherUserId,
        email: 'other@example.com',
        provider: 'google',
        provider_id: 'google-456',
        nickname: '다른 사용자',
        profile_image: null,
        preferences: null,
        fcm_token: null,
        created_at: now,
        updated_at: now,
      });

      // 두 사용자의 북마크 생성
      mockEnv.DB.data.set('bookmarks', [
        {
          user_id: testUserId,
          policy_id: 'POL001',
          notify_before_days: 3,
          created_at: now,
        },
        {
          user_id: otherUserId,
          policy_id: 'POL001',
          notify_before_days: 3,
          created_at: now,
        },
      ]);

      // testUserId로 POL001 삭제
      const response = await testRequest('DELETE', '/api/v1/bookmarks/POL001', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.status).toBe(204);

      // 내 북마크만 삭제되고 다른 사용자 북마크는 유지
      const bookmarks = mockEnv.DB.data.get('bookmarks');
      expect(bookmarks.length).toBe(1);
      expect(bookmarks[0].user_id).toBe(otherUserId);
    });

    it('should return 401 without authentication', async () => {
      const response = await testRequest('DELETE', '/api/v1/bookmarks/POL001', {
        env: mockEnv,
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('UNAUTHORIZED');
    });
  });
});
