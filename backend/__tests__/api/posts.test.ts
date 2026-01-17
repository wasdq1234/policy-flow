/**
 * 게시글 API 테스트 (TDD RED)
 * Phase 4, T4.1 - 게시글 API
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testRequest, createMockEnv } from '../utils/test-helpers';
import { generateAccessToken } from '@/utils/jwt';

describe('Posts API', () => {
  let mockEnv: any;
  let testUserId: string;
  let testUserId2: string;
  let authToken: string;
  let authToken2: string;

  beforeEach(() => {
    mockEnv = createMockEnv();

    // 테스트 사용자 생성
    testUserId = 'user-001';
    testUserId2 = 'user-002';

    const users = mockEnv.DB.data.get('users');
    users.push({
      id: testUserId,
      email: 'test1@example.com',
      provider: 'google',
      provider_id: 'google-123',
      nickname: '테스터1',
      profile_image: null,
      preferences: null,
      fcm_token: null,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    });
    users.push({
      id: testUserId2,
      email: 'test2@example.com',
      provider: 'kakao',
      provider_id: 'kakao-456',
      nickname: '테스터2',
      profile_image: null,
      preferences: null,
      fcm_token: null,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    });

    // 인증 토큰 생성
    authToken = generateAccessToken(testUserId, 'test1@example.com', mockEnv.JWT_SECRET);
    authToken2 = generateAccessToken(testUserId2, 'test2@example.com', mockEnv.JWT_SECRET);

    // 테스트용 정책 데이터 추가
    const policies = mockEnv.DB.data.get('policies');
    const now = Math.floor(Date.now() / 1000);

    policies.push({
      id: 'POL001',
      title: '청년 일자리 지원 사업',
      summary: '만 18세~34세 청년 대상 취업 지원',
      category: 'JOB',
      region: 'SEOUL',
      target_age_min: 18,
      target_age_max: 34,
      start_date: now,
      end_date: now + 86400 * 30,
      is_always_open: 0,
      apply_url: 'https://example.com/apply/POL001',
      detail_json: null,
      created_at: now,
      updated_at: now,
    });

    // 테스트용 게시글 데이터 추가
    const posts = mockEnv.DB.data.get('posts');
    posts.push(
      {
        id: 1,
        policy_id: 'POL001',
        user_id: testUserId,
        nickname: '테스터1',
        title: '청년 일자리 지원 후기',
        content: '정말 유용한 정책이에요!',
        post_type: 'REVIEW',
        view_count: 10,
        like_count: 5,
        is_deleted: 0,
        created_at: now - 3600,
        updated_at: null,
      },
      {
        id: 2,
        policy_id: null,
        user_id: testUserId2,
        nickname: '테스터2',
        title: '정책 신청 꿀팁',
        content: '이렇게 하면 쉬워요!',
        post_type: 'TIP',
        view_count: 20,
        like_count: 3,
        is_deleted: 0,
        created_at: now - 7200,
        updated_at: null,
      },
      {
        id: 3,
        policy_id: 'POL001',
        user_id: testUserId,
        nickname: '테스터1',
        title: '신청 방법 궁금합니다',
        content: '어떻게 신청하나요?',
        post_type: 'QUESTION',
        view_count: 5,
        like_count: 0,
        is_deleted: 0,
        created_at: now - 10800,
        updated_at: null,
      }
    );

    // 좋아요 데이터 추가
    const postLikes = mockEnv.DB.data.get('post_likes');
    postLikes.push({
      user_id: testUserId,
      post_id: 2,
      created_at: now,
    });
  });

  describe('GET /api/v1/posts', () => {
    it('should return posts list with default pagination', async () => {
      const response = await testRequest('GET', '/api/v1/posts', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.meta).toBeDefined();
      expect(json.meta.page).toBe(1);
      expect(json.meta.limit).toBe(20);
      expect(json.meta.total).toBeGreaterThanOrEqual(3);
      expect(json.meta.hasNext).toBeDefined();
    });

    it('should return posts with custom pagination', async () => {
      const response = await testRequest('GET', '/api/v1/posts?page=1&limit=2', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.data.length).toBeLessThanOrEqual(2);
      expect(json.meta.page).toBe(1);
      expect(json.meta.limit).toBe(2);
    });

    it('should filter posts by type', async () => {
      const response = await testRequest('GET', '/api/v1/posts?type=TIP', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      json.data.forEach((post: any) => {
        expect(post.postType).toBe('TIP');
      });
    });

    it('should filter posts by policyId', async () => {
      const response = await testRequest('GET', '/api/v1/posts?policyId=POL001', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      json.data.forEach((post: any) => {
        expect(post.policyId).toBe('POL001');
      });
      expect(json.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should return 400 for invalid type', async () => {
      const response = await testRequest('GET', '/api/v1/posts?type=INVALID', {
        env: mockEnv,
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return posts ordered by created_at DESC', async () => {
      const response = await testRequest('GET', '/api/v1/posts', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data.length).toBeGreaterThanOrEqual(2);
      // 첫 번째 게시글이 가장 최신
      expect(json.data[0].id).toBe(1); // created_at이 가장 최근
    });
  });

  describe('POST /api/v1/posts', () => {
    it('should create a new post with authentication', async () => {
      const response = await testRequest('POST', '/api/v1/posts', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          type: 'QUESTION',
          title: '새로운 질문입니다',
          content: '궁금한 점이 있어요',
          authorNickname: '테스터1',
        },
      });

      expect(response.status).toBe(201);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.data.id).toBeDefined();
      expect(json.data.title).toBe('새로운 질문입니다');
      expect(json.data.content).toBe('궁금한 점이 있어요');
      expect(json.data.postType).toBe('QUESTION');
      expect(json.data.nickname).toBe('테스터1');
      expect(json.data.userId).toBe(testUserId);
      expect(json.data.policyId).toBeNull();
      expect(json.data.likeCount).toBe(0);
      expect(json.data.viewCount).toBe(0);
    });

    it('should create a post with policyId', async () => {
      const response = await testRequest('POST', '/api/v1/posts', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          type: 'REVIEW',
          title: '정책 후기',
          content: '정말 좋았어요',
          policyId: 'POL001',
          authorNickname: '테스터1',
        },
      });

      expect(response.status).toBe(201);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.data.policyId).toBe('POL001');
    });

    it('should return 401 without authentication', async () => {
      const response = await testRequest('POST', '/api/v1/posts', {
        env: mockEnv,
        body: {
          type: 'TIP',
          title: '인증 없음',
          content: '테스트',
          authorNickname: '익명',
        },
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBeDefined();
    });

    it('should return 400 for invalid post data', async () => {
      const response = await testRequest('POST', '/api/v1/posts', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          type: 'INVALID',
          title: '',
          content: '',
        },
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/posts/:id', () => {
    it('should return post detail by id', async () => {
      const response = await testRequest('GET', '/api/v1/posts/1', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.data.id).toBe(1);
      expect(json.data.title).toBe('청년 일자리 지원 후기');
      expect(json.data.content).toBe('정말 유용한 정책이에요!');
      expect(json.data.postType).toBe('REVIEW');
      expect(json.data.policyId).toBe('POL001');
      expect(json.data.userId).toBe(testUserId);
      expect(json.data.nickname).toBe('테스터1');
      expect(json.data.likeCount).toBe(5);
      expect(json.data.viewCount).toBeGreaterThanOrEqual(10);
    });

    it('should return 404 for non-existent post', async () => {
      const response = await testRequest('GET', '/api/v1/posts/9999', {
        env: mockEnv,
      });

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should increment view count on detail view', async () => {
      const response1 = await testRequest('GET', '/api/v1/posts/1', {
        env: mockEnv,
      });
      const json1 = await response1.json();
      const initialViewCount = json1.data.viewCount;

      const response2 = await testRequest('GET', '/api/v1/posts/1', {
        env: mockEnv,
      });
      const json2 = await response2.json();

      expect(json2.data.viewCount).toBe(initialViewCount + 1);
    });
  });

  describe('PATCH /api/v1/posts/:id', () => {
    it('should update post as author', async () => {
      const response = await testRequest('PATCH', '/api/v1/posts/1', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          title: '수정된 제목',
          content: '수정된 내용',
        },
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.data.id).toBe(1);
      expect(json.data.title).toBe('수정된 제목');
      expect(json.data.content).toBe('수정된 내용');
      expect(json.data.updatedAt).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const response = await testRequest('PATCH', '/api/v1/posts/1', {
        env: mockEnv,
        body: {
          title: '수정 시도',
        },
      });

      expect(response.status).toBe(401);
    });

    it('should return 403 when non-author tries to update', async () => {
      const response = await testRequest('PATCH', '/api/v1/posts/1', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken2}`,
        },
        body: {
          title: '다른 사용자 수정 시도',
        },
      });

      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 for non-existent post', async () => {
      const response = await testRequest('PATCH', '/api/v1/posts/9999', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          title: '존재하지 않는 게시글',
        },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/posts/:id', () => {
    it('should delete post as author', async () => {
      const response = await testRequest('DELETE', '/api/v1/posts/1', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.data).toBeDefined();
      expect(json.data.success).toBe(true);

      // 삭제 확인
      const getResponse = await testRequest('GET', '/api/v1/posts/1', {
        env: mockEnv,
      });
      expect(getResponse.status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const response = await testRequest('DELETE', '/api/v1/posts/1', {
        env: mockEnv,
      });

      expect(response.status).toBe(401);
    });

    it('should return 403 when non-author tries to delete', async () => {
      const response = await testRequest('DELETE', '/api/v1/posts/1', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken2}`,
        },
      });

      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 for non-existent post', async () => {
      const response = await testRequest('DELETE', '/api/v1/posts/9999', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/posts/:id/like', () => {
    it('should toggle like (add)', async () => {
      const response = await testRequest('POST', '/api/v1/posts/1/like', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.data.liked).toBe(true);
      expect(json.data.likeCount).toBe(6); // 기존 5 + 1
    });

    it('should toggle like (remove)', async () => {
      const response = await testRequest('POST', '/api/v1/posts/2/like', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.data.liked).toBe(false); // 이미 좋아요한 게시글이므로 취소
      expect(json.data.likeCount).toBe(2); // 기존 3 - 1
    });

    it('should return 401 without authentication', async () => {
      const response = await testRequest('POST', '/api/v1/posts/1/like', {
        env: mockEnv,
      });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent post', async () => {
      const response = await testRequest('POST', '/api/v1/posts/9999/like', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });
  });
});
