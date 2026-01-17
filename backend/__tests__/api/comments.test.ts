/**
 * 댓글 API 테스트 (TDD RED)
 * Phase 4, T4.2 - 댓글 API
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testRequest, createMockEnv } from '../utils/test-helpers';
import { generateAccessToken } from '@/utils/jwt';

describe('Comments API', () => {
  let mockEnv: any;
  let testUserId: string;
  let testUserId2: string;
  let authToken: string;
  let authToken2: string;
  let testPostId: number;

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

    // 테스트용 게시글 생성
    const posts = mockEnv.DB.data.get('posts');
    const now = Math.floor(Date.now() / 1000);

    posts.push({
      id: 1,
      policy_id: null,
      user_id: testUserId,
      nickname: '테스터1',
      title: '테스트 게시글',
      content: '댓글을 달아보세요',
      post_type: 'GENERAL',
      view_count: 0,
      like_count: 0,
      is_deleted: 0,
      created_at: now,
      updated_at: null,
    });

    testPostId = 1;

    // 테스트용 댓글 데이터
    const comments = mockEnv.DB.data.get('comments');
    comments.push(
      {
        id: 1,
        post_id: testPostId,
        parent_id: null,
        user_id: testUserId,
        nickname: '테스터1',
        content: '첫 번째 댓글입니다',
        like_count: 2,
        is_deleted: 0,
        created_at: now - 3600,
      },
      {
        id: 2,
        post_id: testPostId,
        parent_id: 1, // 대댓글
        user_id: testUserId2,
        nickname: '테스터2',
        content: '대댓글입니다',
        like_count: 0,
        is_deleted: 0,
        created_at: now - 1800,
      },
      {
        id: 3,
        post_id: testPostId,
        parent_id: null,
        user_id: testUserId2,
        nickname: '테스터2',
        content: '두 번째 댓글입니다',
        like_count: 1,
        is_deleted: 0,
        created_at: now - 900,
      }
    );
  });

  describe('GET /api/v1/posts/:postId/comments', () => {
    it('should return comments list for a post', async () => {
      const response = await testRequest('GET', `/api/v1/posts/${testPostId}/comments`, {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThanOrEqual(2); // 2개의 루트 댓글

      // 첫 번째 댓글 검증
      const firstComment = json.data[0];
      expect(firstComment.id).toBeDefined();
      expect(firstComment.content).toBeDefined();
      expect(firstComment.nickname).toBeDefined();
      expect(firstComment.parentId).toBeNull();
      expect(firstComment.likeCount).toBeGreaterThanOrEqual(0);
      expect(firstComment.createdAt).toBeDefined();
    });

    it('should return empty list for post with no comments', async () => {
      // 댓글이 없는 게시글 생성
      const posts = mockEnv.DB.data.get('posts');
      const now = Math.floor(Date.now() / 1000);
      posts.push({
        id: 2,
        policy_id: null,
        user_id: testUserId,
        nickname: '테스터1',
        title: '댓글 없는 게시글',
        content: '댓글이 없어요',
        post_type: 'QUESTION',
        view_count: 0,
        like_count: 0,
        is_deleted: 0,
        created_at: now,
        updated_at: null,
      });

      const response = await testRequest('GET', '/api/v1/posts/2/comments', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBe(0);
    });

    it('should return 404 for non-existent post', async () => {
      const response = await testRequest('GET', '/api/v1/posts/9999/comments', {
        env: mockEnv,
      });

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should support pagination', async () => {
      const response = await testRequest('GET', `/api/v1/posts/${testPostId}/comments?page=1&limit=2`, {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.meta).toBeDefined();
      expect(json.meta.page).toBe(1);
      expect(json.meta.limit).toBe(2);
      expect(json.meta.total).toBeDefined();
      expect(json.meta.hasNext).toBeDefined();
    });

    it('should include isLikedByMe when authenticated', async () => {
      // 댓글에 좋아요 추가
      const commentLikes = mockEnv.DB.data.get('comment_likes');
      const now = Math.floor(Date.now() / 1000);
      commentLikes.push({
        user_id: testUserId,
        comment_id: 1,
        created_at: now,
      });

      const response = await testRequest('GET', `/api/v1/posts/${testPostId}/comments`, {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      const likedComment = json.data.find((c: any) => c.id === 1);
      expect(likedComment.isLikedByMe).toBe(true);
    });
  });

  describe('POST /api/v1/posts/:postId/comments', () => {
    it('should create a new comment with authentication', async () => {
      const response = await testRequest('POST', `/api/v1/posts/${testPostId}/comments`, {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          content: '새로운 댓글입니다',
          nickname: '테스터1',
        },
      });

      expect(response.status).toBe(201);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.data.id).toBeDefined();
      expect(json.data.content).toBe('새로운 댓글입니다');
      expect(json.data.nickname).toBe('테스터1');
      expect(json.data.parentId).toBeNull();
      expect(json.data.createdAt).toBeDefined();
    });

    it('should create a reply comment with parentId', async () => {
      const response = await testRequest('POST', `/api/v1/posts/${testPostId}/comments`, {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken2}`,
        },
        body: {
          content: '대댓글 작성',
          parentId: 1,
          nickname: '테스터2',
        },
      });

      expect(response.status).toBe(201);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.data.content).toBe('대댓글 작성');
      expect(json.data.parentId).toBe(1);
      expect(json.data.nickname).toBe('테스터2');
    });

    it('should return 401 without authentication', async () => {
      const response = await testRequest('POST', `/api/v1/posts/${testPostId}/comments`, {
        env: mockEnv,
        body: {
          content: '인증 없이 작성',
          nickname: '익명',
        },
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBeDefined();
    });

    it('should return 404 for non-existent post', async () => {
      const response = await testRequest('POST', '/api/v1/posts/9999/comments', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          content: '존재하지 않는 게시글에 댓글',
          nickname: '테스터1',
        },
      });

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid comment data', async () => {
      const response = await testRequest('POST', `/api/v1/posts/${testPostId}/comments`, {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          content: '', // 빈 내용
        },
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent parent comment', async () => {
      const response = await testRequest('POST', `/api/v1/posts/${testPostId}/comments`, {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          content: '대댓글',
          parentId: 9999, // 존재하지 않는 부모 댓글
          nickname: '테스터1',
        },
      });

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.error).toBeDefined();
    });
  });

  describe('DELETE /api/v1/comments/:id', () => {
    it('should delete comment as author', async () => {
      const response = await testRequest('DELETE', '/api/v1/comments/1', {
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
      const comments = mockEnv.DB.data.get('comments');
      const deletedComment = comments.find((c: any) => c.id === 1);
      expect(deletedComment.is_deleted).toBe(1);
    });

    it('should return 401 without authentication', async () => {
      const response = await testRequest('DELETE', '/api/v1/comments/1', {
        env: mockEnv,
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBeDefined();
    });

    it('should return 403 when non-author tries to delete', async () => {
      const response = await testRequest('DELETE', '/api/v1/comments/1', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken2}`, // user2가 user1의 댓글 삭제 시도
        },
      });

      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('FORBIDDEN');
    });

    it('should return 404 for non-existent comment', async () => {
      const response = await testRequest('DELETE', '/api/v1/comments/9999', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/v1/comments/:id/like', () => {
    it('should toggle like (add)', async () => {
      const response = await testRequest('POST', '/api/v1/comments/3/like', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.data.liked).toBe(true);
      expect(json.data.likeCount).toBe(2); // 기존 1 + 1
    });

    it('should toggle like (remove)', async () => {
      // 기존 좋아요 추가
      const commentLikes = mockEnv.DB.data.get('comment_likes');
      const now = Math.floor(Date.now() / 1000);
      commentLikes.push({
        user_id: testUserId,
        comment_id: 1,
        created_at: now,
      });

      const response = await testRequest('POST', '/api/v1/comments/1/like', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.data.liked).toBe(false);
      expect(json.data.likeCount).toBe(1); // 기존 2 - 1
    });

    it('should return 401 without authentication', async () => {
      const response = await testRequest('POST', '/api/v1/comments/1/like', {
        env: mockEnv,
      });

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBeDefined();
    });

    it('should return 404 for non-existent comment', async () => {
      const response = await testRequest('POST', '/api/v1/comments/9999/like', {
        env: mockEnv,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('NOT_FOUND');
    });
  });
});
