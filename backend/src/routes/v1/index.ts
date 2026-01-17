/**
 * API v1 라우트 집합
 * 모든 /api/v1 엔드포인트를 여기서 마운트
 */
import { Hono } from 'hono';
import type { Env } from '../../types';
import authRoutes from './auth';

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
    },
  });
});

// Phase 1: 인증 라우트 마운트
v1.route('/auth', authRoutes);

// TODO: 추가 라우트
// v1.route('/policies', policiesRoutes);
// v1.route('/users', usersRoutes);
// v1.route('/bookmarks', bookmarksRoutes);
// v1.route('/posts', postsRoutes);

export default v1;
