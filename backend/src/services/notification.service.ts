/**
 * 알림 서비스
 * 마감 임박 정책 조회 및 FCM 푸시 알림 발송
 */
import type { D1Database } from '@cloudflare/workers-types';
import type { Policy } from '../db/schema';

export interface UserWithFcmToken {
  id: string;
  email: string | null;
  nickname: string;
  fcmToken: string;
}

/**
 * 마감 임박 정책 조회 (7일 이내)
 */
export async function getClosingSoonPolicies(
  db: D1Database
): Promise<Policy[]> {
  const now = Math.floor(Date.now() / 1000);
  const sevenDaysLater = now + 7 * 86400; // 7일 = 604800초

  const query = `
    SELECT
      id,
      title,
      summary,
      category,
      region,
      target_age_min,
      target_age_max,
      start_date,
      end_date,
      is_always_open,
      apply_url,
      detail_json,
      created_at,
      updated_at
    FROM policies
    WHERE
      is_always_open = 0
      AND end_date IS NOT NULL
      AND end_date > ?
      AND end_date <= ?
    ORDER BY end_date ASC
  `;

  const result = await db.prepare(query).bind(now, sevenDaysLater).all<any>();

  return (result.results || []).map((row) => ({
    id: row.id,
    title: row.title,
    summary: row.summary,
    category: row.category,
    region: row.region,
    targetAgeMin: row.target_age_min,
    targetAgeMax: row.target_age_max,
    startDate: row.start_date,
    endDate: row.end_date,
    isAlwaysOpen: Boolean(row.is_always_open),
    applyUrl: row.apply_url,
    detailJson: row.detail_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * 특정 정책을 북마크한 사용자 목록 (FCM 토큰 있는 사용자만)
 */
export async function getUsersForPolicy(
  db: D1Database,
  policyId: string
): Promise<UserWithFcmToken[]> {
  const query = `
    SELECT
      u.id,
      u.email,
      u.nickname,
      u.fcm_token
    FROM users u
    INNER JOIN bookmarks b ON u.id = b.user_id
    WHERE
      b.policy_id = ?
      AND u.fcm_token IS NOT NULL
      AND u.fcm_token != ''
  `;

  const result = await db.prepare(query).bind(policyId).all<any>();

  return (result.results || []).map((row) => ({
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    fcmToken: row.fcm_token,
  }));
}

/**
 * 푸시 알림 발송 (Mock: 콘솔 로그만)
 * 실제 FCM 연동은 나중에 구현
 */
export async function sendPushNotification(
  token: string,
  title: string,
  body: string
): Promise<void> {
  // Mock: 실제 FCM 연동 대신 콘솔에 로그 출력
  console.log(`[FCM Mock] Sending notification to ${token}:`, {
    title,
    body,
  });

  // 실제 구현 시:
  // const message = {
  //   token,
  //   notification: { title, body },
  // };
  // await admin.messaging().send(message);
}

/**
 * 마감 임박 알림 발송 (메인 로직)
 */
export async function sendClosingSoonNotifications(
  db: D1Database
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  try {
    // 1. 마감 임박 정책 조회
    const policies = await getClosingSoonPolicies(db);

    if (policies.length === 0) {
      console.log('[Notification] No closing soon policies found.');
      return { sent, failed };
    }

    console.log(`[Notification] Found ${policies.length} closing soon policies.`);

    // 2. 각 정책에 대해 알림 발송
    for (const policy of policies) {
      const users = await getUsersForPolicy(db, policy.id);

      if (users.length === 0) {
        console.log(`[Notification] No users to notify for policy ${policy.id}`);
        continue;
      }

      console.log(
        `[Notification] Sending notifications to ${users.length} users for policy ${policy.id}`
      );

      // 3. 각 사용자에게 알림 발송
      for (const user of users) {
        try {
          const title = '정책 마감 임박!';
          const body = `"${policy.title}" 정책이 곧 마감됩니다. 서둘러 신청하세요!`;

          await sendPushNotification(user.fcmToken, title, body);
          sent++;
        } catch (error) {
          console.error(
            `[Notification] Failed to send notification to user ${user.id}:`,
            error
          );
          failed++;
        }
      }
    }

    console.log(`[Notification] Sent: ${sent}, Failed: ${failed}`);
  } catch (error) {
    console.error('[Notification] Error in sendClosingSoonNotifications:', error);
    throw error;
  }

  return { sent, failed };
}
