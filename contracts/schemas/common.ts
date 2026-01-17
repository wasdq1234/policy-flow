// contracts/schemas/common.ts
// 공통 Zod 스키마

import { z } from 'zod';

/**
 * 페이지네이션 메타
 */
export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  hasNext: z.boolean(),
});

/**
 * API 응답 래퍼
 */
export function apiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema,
    meta: paginationMetaSchema.optional(),
  });
}

/**
 * API 에러 응답
 */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z
      .array(
        z.object({
          field: z.string(),
          message: z.string(),
        })
      )
      .optional(),
  }),
});

/**
 * 페이지네이션 파라미터
 */
export const paginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
