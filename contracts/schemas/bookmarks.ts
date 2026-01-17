// contracts/schemas/bookmarks.ts
// 북마크 API Zod 스키마

import { z } from 'zod';
import { policyListItemSchema } from './policies';

/**
 * GET /api/v1/bookmarks
 */
export const bookmarkListItemSchema = z.object({
  policyId: z.string(),
  policy: policyListItemSchema,
  notifyBeforeDays: z.number().int().positive(),
  createdAt: z.number().int().positive(),
});

/**
 * POST /api/v1/bookmarks
 */
export const createBookmarkRequestSchema = z.object({
  policyId: z.string().min(1, '정책 ID가 필요합니다'),
  notifyBeforeDays: z.number().int().positive().optional().default(3),
});

export const createBookmarkResponseSchema = z.object({
  policyId: z.string(),
  notifyBeforeDays: z.number().int().positive(),
  createdAt: z.number().int().positive(),
});
