// contracts/schemas/policies.ts
// 정책 API Zod 스키마

import { z } from 'zod';
import {
  POLICY_CATEGORIES,
  REGIONS,
  POLICY_STATUSES,
} from '../constants';

/**
 * GET /api/v1/policies
 */
export const getPoliciesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  region: z.enum(REGIONS).optional(),
  category: z.enum(POLICY_CATEGORIES).optional(),
  status: z.enum(POLICY_STATUSES).optional(),
  search: z.string().max(100).optional(),
});

export const policyListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  category: z.enum(POLICY_CATEGORIES),
  region: z.enum(REGIONS),
  status: z.enum(POLICY_STATUSES),
  startDate: z.number().int().nullable(),
  endDate: z.number().int().nullable(),
  isAlwaysOpen: z.boolean(),
});

/**
 * GET /api/v1/policies/:id
 */
export const policyDetailSchema = policyListItemSchema.extend({
  applyUrl: z.string().url().nullable(),
  targetAgeMin: z.number().int().nullable(),
  targetAgeMax: z.number().int().nullable(),
  detailJson: z.string().nullable(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});
