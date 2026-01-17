/**
 * 인증 서비스
 * OAuth 토큰 검증, JWT 발급, 로그인/로그아웃 처리
 */
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { users, authTokens } from '../db/schema';
import type { User, NewUser, AuthToken, NewAuthToken } from '../db/schema';
import type { AuthProvider } from '../../../contracts/constants';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';

/**
 * OAuth 사용자 정보
 */
export interface OAuthUserInfo {
  provider: AuthProvider;
  providerId: string;
  email: string | null;
  nickname: string;
  profileImage: string | null;
}

/**
 * 로그인 응답
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string | null;
    nickname: string;
    profileImage: string | null;
    createdAt: number;
  };
}

/**
 * 토큰 갱신 응답
 */
export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

/**
 * OAuth 토큰 검증 (Mock 구현 - 실제로는 Google/Kakao API 호출)
 *
 * 테스트 환경에서는 토큰 값에 따라 다른 사용자 정보 반환
 */
export async function verifyOAuthToken(
  provider: AuthProvider,
  token: string
): Promise<OAuthUserInfo | null> {
  // Mock 구현: 실제로는 OAuth Provider API 호출
  // Google: https://oauth2.googleapis.com/tokeninfo?access_token={token}
  // Kakao: https://kapi.kakao.com/v2/user/me (Bearer {token})

  if (token === 'invalid-token') {
    return null;
  }

  // 테스트용 Mock 데이터
  const mockUsers: Record<string, OAuthUserInfo> = {
    'valid-google-token': {
      provider: 'google',
      providerId: 'google-user-123',
      email: 'user@gmail.com',
      nickname: '구글 사용자',
      profileImage: 'https://example.com/avatar.jpg',
    },
    'valid-kakao-token': {
      provider: 'kakao',
      providerId: 'kakao-user-456',
      email: 'user@kakao.com',
      nickname: '카카오 사용자',
      profileImage: 'https://example.com/avatar.jpg',
    },
    'new-user-google-token': {
      provider: 'google',
      providerId: 'google-new-user',
      email: 'newuser@gmail.com',
      nickname: '새 사용자',
      profileImage: null,
    },
    'existing-user-token': {
      provider: 'google',
      providerId: 'google-existing-user',
      email: 'existing@gmail.com',
      nickname: '기존 사용자',
      profileImage: null,
    },
  };

  return mockUsers[token] || {
    provider,
    providerId: `${provider}-${Math.random().toString(36).substr(2, 9)}`,
    email: `user-${Date.now()}@example.com`,
    nickname: `사용자${Math.floor(Math.random() * 1000)}`,
    profileImage: null,
  };
}

/**
 * 로그인 또는 회원가입 처리
 * 1. OAuth 토큰 검증
 * 2. 사용자 조회/생성
 * 3. JWT 발급
 * 4. Refresh Token DB 저장
 */
export async function loginOrRegister(
  db: D1Database,
  provider: AuthProvider,
  oauthToken: string,
  jwtSecret: string,
  accessExpiry: number = 3600,
  refreshExpiry: number = 604800
): Promise<LoginResponse> {
  // 1. OAuth 토큰 검증
  const oauthInfo = await verifyOAuthToken(provider, oauthToken);
  if (!oauthInfo) {
    throw new Error('OAUTH_VERIFICATION_FAILED');
  }

  const orm = drizzle(db);

  // 2. 기존 사용자 조회
  const existingUsers = await orm
    .select()
    .from(users)
    .where(
      and(
        eq(users.provider, oauthInfo.provider),
        eq(users.providerId, oauthInfo.providerId)
      )
    )
    .limit(1);

  let user: User;
  const now = Math.floor(Date.now() / 1000);

  if (existingUsers.length > 0) {
    // 기존 사용자
    user = existingUsers[0];
  } else {
    // 새 사용자 생성
    const newUser: NewUser = {
      id: uuidv4(),
      email: oauthInfo.email,
      provider: oauthInfo.provider,
      providerId: oauthInfo.providerId,
      nickname: oauthInfo.nickname,
      profileImage: oauthInfo.profileImage,
      preferences: null,
      fcmToken: null,
      createdAt: now,
      updatedAt: now,
    };

    await orm.insert(users).values(newUser);
    user = newUser as User;
  }

  // 3. JWT 토큰 생성
  const accessToken = generateAccessToken(user.id, user.email, jwtSecret, accessExpiry);
  const refreshToken = generateRefreshToken(user.id, user.email, jwtSecret, refreshExpiry);

  // 4. Refresh Token DB 저장
  const newAuthToken: NewAuthToken = {
    id: uuidv4(),
    userId: user.id,
    refreshToken,
    expiresAt: now + refreshExpiry,
    createdAt: now,
  };

  await orm.insert(authTokens).values(newAuthToken);

  return {
    accessToken,
    refreshToken,
    expiresIn: accessExpiry,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    },
  };
}

/**
 * Access Token 갱신
 * 1. Refresh Token 검증
 * 2. DB에서 유효성 확인
 * 3. 새 Access Token 발급
 */
export async function refreshAccessToken(
  db: D1Database,
  refreshToken: string,
  jwtSecret: string,
  accessExpiry: number = 3600
): Promise<RefreshResponse> {
  // 1. Refresh Token 검증
  const payload = verifyToken(refreshToken, jwtSecret);
  if (!payload || payload.type !== 'refresh') {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const orm = drizzle(db);
  const now = Math.floor(Date.now() / 1000);

  // 2. DB에서 토큰 조회 및 만료 확인
  const tokens = await orm
    .select()
    .from(authTokens)
    .where(eq(authTokens.refreshToken, refreshToken))
    .limit(1);

  if (tokens.length === 0) {
    throw new Error('REFRESH_TOKEN_NOT_FOUND');
  }

  const token = tokens[0];

  if (token.expiresAt < now) {
    throw new Error('REFRESH_TOKEN_EXPIRED');
  }

  // 3. 사용자 정보 조회
  const userList = await orm
    .select()
    .from(users)
    .where(eq(users.id, token.userId))
    .limit(1);

  if (userList.length === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  const user = userList[0];

  // 4. 새 Access Token 발급
  const accessToken = generateAccessToken(user.id, user.email, jwtSecret, accessExpiry);

  return {
    accessToken,
    expiresIn: accessExpiry,
  };
}

/**
 * 로그아웃
 * Refresh Token 무효화 (DB에서 삭제)
 * 해당 사용자의 모든 토큰 삭제
 */
export async function logout(
  db: D1Database,
  userId: string
): Promise<void> {
  const orm = drizzle(db);

  await orm
    .delete(authTokens)
    .where(eq(authTokens.userId, userId));
}
