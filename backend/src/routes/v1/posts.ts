/**
 * 게시글 API 라우트
 * GET /api/v1/posts - 게시글 목록 조회
 * POST /api/v1/posts - 게시글 작성
 * GET /api/v1/posts/:id - 게시글 상세 조회
 * PATCH /api/v1/posts/:id - 게시글 수정
 * DELETE /api/v1/posts/:id - 게시글 삭제
 * POST /api/v1/posts/:id/like - 좋아요 토글
 */
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../../types';
import { requireAuth, optionalAuth } from '../../middleware/auth';
import { NotFoundError, ForbiddenError } from '../../middleware/error-handler';
import {
  getPostsQuerySchema,
  createPostRequestSchema,
  updatePostRequestSchema,
} from '../../../../contracts/schemas/posts';
import {
  getPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
} from '../../services/posts.service';

const postsRoutes = new Hono<Env>();

/**
 * GET /api/v1/posts
 * 게시글 목록 조회 (필터링, 페이지네이션)
 */
postsRoutes.get(
  '/',
  zValidator('query', getPostsQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '쿼리 파라미터가 올바르지 않습니다.',
            details: result.error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        },
        400
      );
    }
  }),
  async (c) => {
    const query = c.req.valid('query');

    const { data, total } = await getPosts(c.env.DB, query);

    return c.json({
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        hasNext: query.page * query.limit < total,
      },
    });
  }
);

/**
 * POST /api/v1/posts
 * 게시글 작성 (인증 필수)
 */
postsRoutes.post(
  '/',
  requireAuth,
  zValidator('json', createPostRequestSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '요청 데이터가 올바르지 않습니다.',
            details: result.error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        },
        400
      );
    }
  }),
  async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다.',
          },
        },
        401
      );
    }

    const body = c.req.valid('json');
    const result = await createPost(c.env.DB, user.id, body);

    return c.json({ data: result }, 201);
  }
);

/**
 * GET /api/v1/posts/:id
 * 게시글 상세 조회
 */
postsRoutes.get('/:id', optionalAuth, async (c) => {
  const postId = parseInt(c.req.param('id'), 10);

  if (isNaN(postId)) {
    throw new NotFoundError('잘못된 게시글 ID입니다.');
  }

  const user = c.get('user');
  const post = await getPostById(c.env.DB, postId, user?.id);

  if (!post) {
    throw new NotFoundError('요청한 게시글을 찾을 수 없습니다.');
  }

  return c.json({
    data: post,
  });
});

/**
 * PATCH /api/v1/posts/:id
 * 게시글 수정 (작성자만)
 */
postsRoutes.patch(
  '/:id',
  requireAuth,
  zValidator('json', updatePostRequestSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '요청 데이터가 올바르지 않습니다.',
            details: result.error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        },
        400
      );
    }
  }),
  async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다.',
          },
        },
        401
      );
    }

    const postId = parseInt(c.req.param('id'), 10);

    if (isNaN(postId)) {
      throw new NotFoundError('잘못된 게시글 ID입니다.');
    }

    const body = c.req.valid('json');

    try {
      const result = await updatePost(c.env.DB, postId, user.id, body);

      if (!result) {
        throw new NotFoundError('요청한 게시글을 찾을 수 없습니다.');
      }

      return c.json({ data: result });
    } catch (error: any) {
      if (error.message === 'FORBIDDEN') {
        throw new ForbiddenError('본인이 작성한 게시글만 수정할 수 있습니다.');
      }
      throw error;
    }
  }
);

/**
 * DELETE /api/v1/posts/:id
 * 게시글 삭제 (작성자만)
 */
postsRoutes.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: '인증이 필요합니다.',
        },
      },
      401
    );
  }

  const postId = parseInt(c.req.param('id'), 10);

  if (isNaN(postId)) {
    throw new NotFoundError('잘못된 게시글 ID입니다.');
  }

  try {
    const success = await deletePost(c.env.DB, postId, user.id);

    if (!success) {
      throw new NotFoundError('요청한 게시글을 찾을 수 없습니다.');
    }

    return c.json({ data: { success: true } });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN') {
      throw new ForbiddenError('본인이 작성한 게시글만 삭제할 수 있습니다.');
    }
    throw error;
  }
});

/**
 * POST /api/v1/posts/:id/like
 * 좋아요 토글 (인증 필수)
 */
postsRoutes.post('/:id/like', requireAuth, async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: '인증이 필요합니다.',
        },
      },
      401
    );
  }

  const postId = parseInt(c.req.param('id'), 10);

  if (isNaN(postId)) {
    throw new NotFoundError('잘못된 게시글 ID입니다.');
  }

  try {
    const result = await toggleLike(c.env.DB, postId, user.id);

    return c.json({ data: result });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      throw new NotFoundError('요청한 게시글을 찾을 수 없습니다.');
    }
    throw error;
  }
});

export default postsRoutes;
