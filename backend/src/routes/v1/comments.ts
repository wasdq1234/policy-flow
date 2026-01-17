/**
 * 댓글 API 라우트
 * GET /api/v1/posts/:postId/comments - 댓글 목록 조회
 * POST /api/v1/posts/:postId/comments - 댓글 작성
 * DELETE /api/v1/comments/:id - 댓글 삭제
 * POST /api/v1/comments/:id/like - 댓글 좋아요 토글
 */
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../../types';
import { requireAuth, optionalAuth } from '../../middleware/auth';
import { NotFoundError, ForbiddenError } from '../../middleware/error-handler';
import { createCommentRequestSchema } from '../../../../contracts/schemas/posts';
import {
  getCommentsByPostId,
  createComment,
  deleteComment,
  toggleCommentLike,
} from '../../services/comments.service';

const commentsRoutes = new Hono<Env>();

/**
 * GET /api/v1/posts/:postId/comments
 * 댓글 목록 조회
 */
const getCommentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

commentsRoutes.get(
  '/:postId/comments',
  optionalAuth,
  zValidator('query', getCommentsQuerySchema, (result, c) => {
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
    const postId = parseInt(c.req.param('postId'), 10);

    if (isNaN(postId)) {
      throw new NotFoundError('잘못된 게시글 ID입니다.');
    }

    const query = c.req.valid('query');
    const user = c.get('user');

    try {
      const { data, total } = await getCommentsByPostId(
        c.env.DB,
        postId,
        user?.id,
        query.page,
        query.limit
      );

      return c.json({
        data,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          hasNext: query.page * query.limit < total,
        },
      });
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') {
        throw new NotFoundError('요청한 게시글을 찾을 수 없습니다.');
      }
      throw error;
    }
  }
);

/**
 * POST /api/v1/posts/:postId/comments
 * 댓글 작성 (인증 필수)
 */
commentsRoutes.post(
  '/:postId/comments',
  requireAuth,
  zValidator('json', createCommentRequestSchema, (result, c) => {
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

    const postId = parseInt(c.req.param('postId'), 10);

    if (isNaN(postId)) {
      throw new NotFoundError('잘못된 게시글 ID입니다.');
    }

    const body = c.req.valid('json');

    try {
      const result = await createComment(c.env.DB, postId, user.id, body);

      return c.json({ data: result }, 201);
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') {
        throw new NotFoundError('요청한 게시글을 찾을 수 없습니다.');
      }
      if (error.message === 'PARENT_NOT_FOUND') {
        throw new NotFoundError('부모 댓글을 찾을 수 없습니다.');
      }
      throw error;
    }
  }
);

/**
 * DELETE /api/v1/comments/:id
 * 댓글 삭제 (작성자만)
 */
commentsRoutes.delete('/:id', requireAuth, async (c) => {
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

  const commentId = parseInt(c.req.param('id'), 10);

  if (isNaN(commentId)) {
    throw new NotFoundError('잘못된 댓글 ID입니다.');
  }

  try {
    const success = await deleteComment(c.env.DB, commentId, user.id);

    if (!success) {
      throw new NotFoundError('요청한 댓글을 찾을 수 없습니다.');
    }

    return c.json({ data: { success: true } });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN') {
      throw new ForbiddenError('본인이 작성한 댓글만 삭제할 수 있습니다.');
    }
    throw error;
  }
});

/**
 * POST /api/v1/comments/:id/like
 * 댓글 좋아요 토글 (인증 필수)
 */
commentsRoutes.post('/:id/like', requireAuth, async (c) => {
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

  const commentId = parseInt(c.req.param('id'), 10);

  if (isNaN(commentId)) {
    throw new NotFoundError('잘못된 댓글 ID입니다.');
  }

  try {
    const result = await toggleCommentLike(c.env.DB, commentId, user.id);

    return c.json({ data: result });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      throw new NotFoundError('요청한 댓글을 찾을 수 없습니다.');
    }
    throw error;
  }
});

export default commentsRoutes;
