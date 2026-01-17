// contracts/users.contract.ts
// 사용자 API 계약 정의

import type { PolicyCategory, Region, UnixTimestamp, AgeGroup } from './types';

/**
 * 사용자 설정 타입
 */
export interface UserPreferences {
  regions: Region[];
  categories: PolicyCategory[];
  ageRange: { min: number; max: number } | null;
  notifyBeforeDays: number[];
}

/**
 * GET /api/v1/users/me
 * 내 정보 조회
 */
export interface UserProfile {
  id: string;
  email: string | null;
  nickname: string;
  profileImage: string | null;
  preferences: UserPreferences | null;
  createdAt: UnixTimestamp;
}

/**
 * PUT /api/v1/users/me/preferences
 * 사용자 설정 저장
 */
export interface UpdatePreferencesRequest {
  ageGroup?: AgeGroup;
  region?: Region;
  interests?: PolicyCategory[];
}

export interface UpdatePreferencesResponse {
  preferences: UserPreferences;
  updatedAt: UnixTimestamp;
}

/**
 * POST /api/v1/users/me/push-token
 * FCM 푸시 토큰 등록
 */
export interface RegisterPushTokenRequest {
  fcmToken: string;
}

export interface RegisterPushTokenResponse {
  success: boolean;
}

/**
 * DELETE /api/v1/users/me
 * 회원 탈퇴
 * Response: 204 No Content
 */
