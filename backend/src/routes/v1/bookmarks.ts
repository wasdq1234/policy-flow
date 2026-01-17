/**
 * 북마크 API 라우트
 * GET /api/v1/bookmarks - 내 북마크 목록 조회
 * POST /api/v1/bookmarks - 북마크 추가
 * DELETE /api/v1/bookmarks/:policyId - 북마크 삭제
 */
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../../types';
import { requireAuth } from '../../middleware/auth';
import {
  createBookmarkRequestSchema,
  bookmarkListItemSchema,
} from '../../../../contracts/schemas/bookmarks';
import { z } from 'zod';
import {
  getBookmarks,
  createBookmark,
  deleteBookmark,
} from '../../services/bookmarks.service';

const bookmarksRoutes = new Hono<Env>();

// 모든 북마크 엔드포인트는 인증 필수
bookmarksRoutes.use('/*', requireAuth);

/**
 * GET /api/v1/bookmarks
 * 내 북마크 목록 조회
 */
bookmarksRoutes.get(
  '/',
  zValidator(
    'query',
    z.object({
      page: z.coerce.number().int().positive().optional().default(1),
      limit: z.coerce.number().int().positive().max(100).optional().default(20),
    }),
    (result, c) => {
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
    }
  ),
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

    const query = c.req.valid('query');
    const { data, total } = await getBookmarks(c.env.DB, user.id, query.page, query.limit);

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
 * POST /api/v1/bookmarks
 * 북마크 추가
 */
bookmarksRoutes.post(
  '/',
  zValidator('json', createBookmarkRequestSchema, (result, c) => {
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
    const result = await createBookmark(
      c.env.DB,
      user.id,
      body.policyId,
      body.notifyBeforeDays
    );

    return c.json({ data: result }, 201);
  }
);

/**
 * DELETE /api/v1/bookmarks/:policyId
 * 북마크 삭제
 */
bookmarksRoutes.delete('/:policyId', async (c) => {
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

  const policyId = c.req.param('policyId');

  await deleteBookmark(c.env.DB, user.id, policyId);

  return c.body(null, 204);
});

export default bookmarksRoutes;
