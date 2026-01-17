// contracts/schemas/users.ts
// 사용자 API Zod 스키마

import { z } from 'zod';
import { POLICY_CATEGORIES, REGIONS } from '../constants';

/**
 * 사용자 설정 스키마
 */
export const userPreferencesSchema = z.object({
  regions: z.array(z.enum(REGIONS)),
  categories: z.array(z.enum(POLICY_CATEGORIES)),
  ageRange: z
    .object({
      min: z.number().int().min(0).max(150),
      max: z.number().int().min(0).max(150),
    })
    .nullable(),
  notifyBeforeDays: z.array(z.number().int().positive()),
});

/**
 * GET /api/v1/users/me
 */
export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email().nullable(),
  nickname: z.string(),
  profileImage: z.string().url().nullable(),
  preferences: userPreferencesSchema.nullable(),
  createdAt: z.number().int().positive(),
});

/**
 * PUT /api/v1/users/me/preferences
 */
export const updatePreferencesRequestSchema = z.object({
  regions: z.array(z.enum(REGIONS)).optional(),
  categories: z.array(z.enum(POLICY_CATEGORIES)).optional(),
  ageRange: z
    .object({
      min: z.number().int().min(0).max(150),
      max: z.number().int().min(0).max(150),
    })
    .nullable()
    .optional(),
  notifyBeforeDays: z.array(z.number().int().positive()).optional(),
});

export const updatePreferencesResponseSchema = z.object({
  preferences: userPreferencesSchema,
  updatedAt: z.number().int().positive(),
});

/**
 * POST /api/v1/users/me/push-token
 */
export const registerPushTokenRequestSchema = z.object({
  fcmToken: z.string().min(1, 'FCM 토큰이 필요합니다'),
});

export const registerPushTokenResponseSchema = z.object({
  success: z.boolean(),
});
