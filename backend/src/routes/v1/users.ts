/**
 * 사용자 API 라우트
 * Phase 1, T1.2 - 사용자 API (프로필/설정)
 */
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../../types';
import { requireAuth } from '../../middleware/auth';
import { NotFoundError, ValidationError } from '../../middleware/error-handler';
import {
  updatePreferencesRequestSchema,
  registerPushTokenRequestSchema,
} from '../../../../contracts/schemas/users';
import {
  getUserProfile,
  updatePreferences,
  registerPushToken,
  deleteAccount,
} from '../../services/users.service';

const usersRoutes = new Hono<Env>();

// Zod validator hook: 에러 발생 시 우리 형식으로 변환
const validationHook = (result: any, c: any) => {
  if (!result.success) {
    const details = result.error.errors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    throw new ValidationError('입력값이 올바르지 않습니다.', details);
  }
};

/**
 * GET /api/v1/users/me
 * 내 정보 조회
 */
usersRoutes.get('/me', requireAuth, async (c) => {
  const user = c.get('user');
  if (!user) {
    throw new NotFoundError('사용자를 찾을 수 없습니다.');
  }

  const profile = await getUserProfile(c.env.DB, user.id);

  if (!profile) {
    throw new NotFoundError('사용자를 찾을 수 없습니다.');
  }

  return c.json({
    data: profile,
  });
});

/**
 * PUT /api/v1/users/me/preferences
 * 사용자 설정 업데이트
 */
usersRoutes.put(
  '/me/preferences',
  requireAuth,
  zValidator('json', updatePreferencesRequestSchema, validationHook),
  async (c) => {
    const user = c.get('user');
    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다.');
    }

    const newPreferences = c.req.valid('json');

    const result = await updatePreferences(c.env.DB, user.id, newPreferences);

    // 전체 프로필 반환
    const profile = await getUserProfile(c.env.DB, user.id);

    return c.json({
      data: {
        ...profile,
        ...result,
      },
    });
  }
);

/**
 * POST /api/v1/users/me/push-token
 * FCM 푸시 토큰 등록
 */
usersRoutes.post(
  '/me/push-token',
  requireAuth,
  zValidator('json', registerPushTokenRequestSchema, validationHook),
  async (c) => {
    const user = c.get('user');
    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다.');
    }

    const { fcmToken } = c.req.valid('json');

    await registerPushToken(c.env.DB, user.id, fcmToken);

    return c.body(null, 204);
  }
);

/**
 * DELETE /api/v1/users/me
 * 회원 탈퇴
 */
usersRoutes.delete('/me', requireAuth, async (c) => {
  const user = c.get('user');
  if (!user) {
    throw new NotFoundError('사용자를 찾을 수 없습니다.');
  }

  await deleteAccount(c.env.DB, user.id);

  return c.body(null, 204);
});

export default usersRoutes;
