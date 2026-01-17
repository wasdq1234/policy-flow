/**
 * 사용자 서비스
 * 프로필 조회, 설정 업데이트, 푸시 토큰 등록, 계정 삭제
 */
import type { UserPreferences } from '../../../contracts/users.contract';

/**
 * 사용자 프로필 조회
 */
export async function getUserProfile(db: D1Database, userId: string) {
  const result = await db
    .prepare('SELECT * FROM users WHERE id = ? LIMIT 1')
    .bind(userId)
    .all();

  if (!result.results || result.results.length === 0) {
    return null;
  }

  const user = result.results[0] as any;

  // preferences가 JSON 문자열이므로 파싱
  let preferences: UserPreferences | null = null;
  if (user.preferences) {
    try {
      preferences = JSON.parse(user.preferences);
    } catch (e) {
      preferences = null;
    }
  }

  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    profileImage: user.profile_image || user.profileImage,
    preferences,
    createdAt: user.created_at || user.createdAt,
  };
}

/**
 * 사용자 설정 업데이트
 */
export async function updatePreferences(
  db: D1Database,
  userId: string,
  newPreferences: Partial<UserPreferences>
): Promise<{ preferences: UserPreferences; updatedAt: number }> {
  // 1. 현재 사용자 조회
  const result = await db
    .prepare('SELECT * FROM users WHERE id = ? LIMIT 1')
    .bind(userId)
    .all();

  if (!result.results || result.results.length === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  const user = result.results[0] as any;

  // 2. 기존 preferences 파싱
  let existingPreferences: Partial<UserPreferences> = {};
  if (user.preferences) {
    try {
      existingPreferences = JSON.parse(user.preferences);
    } catch (e) {
      existingPreferences = {};
    }
  }

  // 3. 병합 (부분 업데이트 지원)
  const mergedPreferences: UserPreferences = {
    regions: newPreferences.regions ?? (existingPreferences.regions as any) ?? [],
    categories: newPreferences.categories ?? (existingPreferences.categories as any) ?? [],
    ageRange: newPreferences.ageRange !== undefined ? newPreferences.ageRange : ((existingPreferences.ageRange as any) ?? null),
    notifyBeforeDays: newPreferences.notifyBeforeDays ?? (existingPreferences.notifyBeforeDays as any) ?? [3],
  };

  const now = Math.floor(Date.now() / 1000);

  // 4. DB 업데이트
  await db
    .prepare('UPDATE users SET preferences = ?, updated_at = ? WHERE id = ?')
    .bind(JSON.stringify(mergedPreferences), now, userId)
    .run();

  return {
    preferences: mergedPreferences,
    updatedAt: now,
  };
}

/**
 * FCM 푸시 토큰 등록
 */
export async function registerPushToken(
  db: D1Database,
  userId: string,
  fcmToken: string
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare('UPDATE users SET fcm_token = ?, updated_at = ? WHERE id = ?')
    .bind(fcmToken, now, userId)
    .run();
}

/**
 * 계정 삭제
 * - users 테이블에서 삭제 (CASCADE로 관련 데이터 자동 삭제)
 * - authTokens도 CASCADE 삭제됨
 */
export async function deleteAccount(
  db: D1Database,
  userId: string
): Promise<void> {
  await db
    .prepare('DELETE FROM users WHERE id = ?')
    .bind(userId)
    .run();
}
