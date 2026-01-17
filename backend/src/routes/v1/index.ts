/**
 * API v1 라우트 집합
 * 모든 /api/v1 엔드포인트를 여기서 마운트
 */
import { Hono } from 'hono';
import type { Env } from '../../types';
import authRoutes from './auth';
import usersRoutes from './users';
import policiesRoutes from './policies';
import bookmarksRoutes from './bookmarks';
import postsRoutes from './posts';
import commentsRoutes from './comments';

const v1 = new Hono<Env>();

/**
 * GET /api/v1
 * API 버전 정보
 */
v1.get('/', (c) => {
  return c.json({
    message: 'PolicyFlow API v1',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      policies: '/api/v1/policies',
      users: '/api/v1/users',
      bookmarks: '/api/v1/bookmarks',
      posts: '/api/v1/posts',
      comments: '/api/v1/comments',
    },
  });
});

// Phase 1: 인증 & 사용자 라우트 마운트
v1.route('/auth', authRoutes);
v1.route('/users', usersRoutes);

// Phase 2: 정책 라우트 마운트
v1.route('/policies', policiesRoutes);

// Phase 3: 북마크 라우트 마운트
v1.route('/bookmarks', bookmarksRoutes);

// Phase 4: 댓글 라우트 마운트 (posts 라우트보다 먼저 등록)
v1.route('/comments', commentsRoutes); // DELETE/POST /comments/:id, /comments/:id/like
v1.route('/posts', commentsRoutes); // GET/POST /posts/:postId/comments

// Phase 4: 게시글 라우트 마운트
v1.route('/posts', postsRoutes);

export default v1;
