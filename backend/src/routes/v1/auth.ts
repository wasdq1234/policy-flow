/**
 * 인증 API 라우트
 * POST /api/v1/auth/login - 소셜 로그인
 * POST /api/v1/auth/refresh - 토큰 갱신
 * DELETE /api/v1/auth/logout - 로그아웃
 */
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Env } from '../../types';
import { loginRequestSchema, refreshRequestSchema } from '../../../../contracts/schemas/auth';
import { loginOrRegister, refreshAccessToken, logout } from '../../services/auth.service';
import { verifyToken } from '../../utils/jwt';
import { UnauthorizedError, ValidationError } from '../../middleware/error-handler';

const authRoutes = new Hono<Env>();

/**
 * POST /api/v1/auth/login
 * 소셜 로그인 (Google, Kakao)
 */
authRoutes.post(
  '/login',
  zValidator('json', loginRequestSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력값이 올바르지 않습니다.',
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
  const { provider, token } = c.req.valid('json');

  try {
    const jwtSecret = c.env.JWT_SECRET || 'default-secret-for-dev';
    const accessExpiry = parseInt(c.env.JWT_ACCESS_EXPIRY || '3600', 10);
    const refreshExpiry = parseInt(c.env.JWT_REFRESH_EXPIRY || '604800', 10);

    const result = await loginOrRegister(
      c.env.DB,
      provider,
      token,
      jwtSecret,
      accessExpiry,
      refreshExpiry
    );

    return c.json({
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'OAUTH_VERIFICATION_FAILED') {
      throw new UnauthorizedError('OAuth 토큰 검증에 실패했습니다.');
    }
    throw error;
  }
});

/**
 * POST /api/v1/auth/refresh
 * Access Token 갱신
 */
authRoutes.post('/refresh', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('인증 토큰이 필요합니다.');
  }

  const refreshToken = authHeader.substring(7); // 'Bearer ' 제거

  try {
    const jwtSecret = c.env.JWT_SECRET || 'default-secret-for-dev';
    const accessExpiry = parseInt(c.env.JWT_ACCESS_EXPIRY || '3600', 10);

    const result = await refreshAccessToken(
      c.env.DB,
      refreshToken,
      jwtSecret,
      accessExpiry
    );

    return c.json({
      data: result,
    });
  } catch (error: any) {
    if (
      error.message === 'INVALID_REFRESH_TOKEN' ||
      error.message === 'REFRESH_TOKEN_NOT_FOUND' ||
      error.message === 'REFRESH_TOKEN_EXPIRED' ||
      error.message === 'USER_NOT_FOUND'
    ) {
      throw new UnauthorizedError('유효하지 않거나 만료된 리프레시 토큰입니다.');
    }
    throw error;
  }
});

/**
 * DELETE /api/v1/auth/logout
 * 로그아웃 (Refresh Token 무효화)
 */
authRoutes.delete('/logout', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('인증 토큰이 필요합니다.');
  }

  const accessToken = authHeader.substring(7); // 'Bearer ' 제거

  try {
    const jwtSecret = c.env.JWT_SECRET || 'default-secret-for-dev';

    // Access Token에서 사용자 ID 추출
    const payload = verifyToken(accessToken, jwtSecret);

    if (!payload || payload.type !== 'access') {
      throw new UnauthorizedError('유효하지 않은 액세스 토큰입니다.');
    }

    // 해당 사용자의 모든 Refresh Token 삭제
    await logout(c.env.DB, payload.userId);

    // 204 No Content
    return c.body(null, 204);
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('로그아웃 처리 중 오류가 발생했습니다.');
  }
});

export default authRoutes;
