/**
 * 정책 API 라우트
 * GET /api/v1/policies - 정책 목록 조회
 * GET /api/v1/policies/:id - 정책 상세 조회
 */
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../../types';
import { getPoliciesQuerySchema } from '../../../../contracts/schemas/policies';
import { getPolicies, getPolicyById } from '../../services/policies.service';
import { NotFoundError } from '../../middleware/error-handler';

const policiesRoutes = new Hono<Env>();

/**
 * GET /api/v1/policies
 * 정책 목록 조회 (필터링, 페이지네이션)
 */
policiesRoutes.get(
  '/',
  zValidator('query', getPoliciesQuerySchema, (result, c) => {
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

    const { data, total } = await getPolicies(c.env.DB, query);

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
 * GET /api/v1/policies/:id
 * 정책 상세 조회
 */
policiesRoutes.get('/:id', async (c) => {
  const policyId = c.req.param('id');

  const policy = await getPolicyById(c.env.DB, policyId);

  if (!policy) {
    throw new NotFoundError('요청한 정책을 찾을 수 없습니다.');
  }

  return c.json({
    data: policy,
  });
});

export default policiesRoutes;
