// contracts/auth.contract.ts
// 인증 API 계약 정의

import type { AuthProvider, UnixTimestamp } from './types';

/**
 * POST /api/v1/auth/login
 * 소셜 로그인
 */
export interface LoginRequest {
  provider: AuthProvider;
  token: string; // OAuth access token
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // 초 단위
  user: {
    id: string;
    email: string | null;
    nickname: string;
    profileImage: string | null;
    createdAt: UnixTimestamp;
  };
}

/**
 * POST /api/v1/auth/refresh
 * 액세스 토큰 갱신
 */
export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number; // 초 단위
}

/**
 * DELETE /api/v1/auth/logout
 * 로그아웃 (리프레시 토큰 무효화)
 * Request: No body
 * Response: 204 No Content
 */
