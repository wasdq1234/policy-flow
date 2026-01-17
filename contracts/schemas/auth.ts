// contracts/schemas/auth.ts
// 인증 API Zod 스키마

import { z } from 'zod';
import { AUTH_PROVIDERS } from '../constants';

/**
 * POST /api/v1/auth/login
 */
export const loginRequestSchema = z.object({
  provider: z.enum(AUTH_PROVIDERS),
  token: z.string().min(1, '토큰이 필요합니다'),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().positive(),
  user: z.object({
    id: z.string(),
    email: z.string().email().nullable(),
    nickname: z.string(),
    profileImage: z.string().url().nullable(),
    createdAt: z.number().int().positive(),
  }),
});

/**
 * POST /api/v1/auth/refresh
 */
export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(1, '리프레시 토큰이 필요합니다'),
});

export const refreshResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number().positive(),
});
