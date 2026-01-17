/**
 * JWT 유틸리티
 * Access Token 및 Refresh Token 생성/검증
 */
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string | null;
  type: 'access' | 'refresh';
}

/**
 * Access Token 생성 (1시간 만료)
 */
export function generateAccessToken(
  userId: string,
  email: string | null,
  secret: string,
  expiresIn: number = 3600
): string {
  const payload: JWTPayload = {
    userId,
    email,
    type: 'access',
  };

  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Refresh Token 생성 (7일 만료)
 */
export function generateRefreshToken(
  userId: string,
  email: string | null,
  secret: string,
  expiresIn: number = 604800
): string {
  const payload: JWTPayload = {
    userId,
    email,
    type: 'refresh',
  };

  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * JWT 검증 및 페이로드 추출
 */
export function verifyToken(token: string, secret: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * JWT 디코드 (검증 없이)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
