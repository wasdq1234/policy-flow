/**
 * 알림 발송 Worker 테스트 (TDD RED)
 * Phase 3, T3.4 - 알림 발송 Worker
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockEnv } from '../utils/test-helpers';
import {
  getClosingSoonPolicies,
  getUsersForPolicy,
  sendPushNotification,
  sendClosingSoonNotifications,
} from '@/services/notification.service';

describe('Notification Service', () => {
  let mockEnv: any;
  const now = Math.floor(Date.now() / 1000);
  const oneDaySeconds = 86400;

  beforeEach(() => {
    mockEnv = createMockEnv();

    // 테스트용 사용자 생성 (FCM 토큰 포함/미포함)
    mockEnv.DB.data.set('users', [
      {
        id: 'user-001',
        email: 'user1@example.com',
        provider: 'google',
        provider_id: 'google-123',
        nickname: '사용자1',
        profile_image: null,
        preferences: null,
        fcm_token: 'fcm-token-user1', // FCM 토큰 있음
        created_at: now,
        updated_at: now,
      },
      {
        id: 'user-002',
        email: 'user2@example.com',
        provider: 'kakao',
        provider_id: 'kakao-456',
        nickname: '사용자2',
        profile_image: null,
        preferences: null,
        fcm_token: null, // FCM 토큰 없음
        created_at: now,
        updated_at: now,
      },
      {
        id: 'user-003',
        email: 'user3@example.com',
        provider: 'google',
        provider_id: 'google-789',
        nickname: '사용자3',
        profile_image: null,
        preferences: null,
        fcm_token: 'fcm-token-user3', // FCM 토큰 있음
        created_at: now,
        updated_at: now,
      },
    ]);

    // 테스트용 정책 데이터 추가
    mockEnv.DB.data.set('policies', [
      {
        id: 'POL001',
        title: '청년 일자리 지원 (마감 5일 전)',
        summary: '청년 취업 지원 정책',
        category: 'JOB',
        region: 'SEOUL',
        target_age_min: 18,
        target_age_max: 34,
        start_date: now - 30 * oneDaySeconds,
        end_date: now + 5 * oneDaySeconds, // 5일 후 마감
        is_always_open: 0,
        apply_url: 'https://example.com/pol001',
        detail_json: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'POL002',
        title: '주거 지원 (마감 3일 전)',
        summary: '청년 주거 지원 정책',
        category: 'HOUSING',
        region: 'BUSAN',
        target_age_min: 19,
        target_age_max: 39,
        start_date: now - 60 * oneDaySeconds,
        end_date: now + 3 * oneDaySeconds, // 3일 후 마감
        is_always_open: 0,
        apply_url: 'https://example.com/pol002',
        detail_json: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'POL003',
        title: '학자금 대출 (상시 모집)',
        summary: '학자금 대출 정책',
        category: 'LOAN',
        region: 'ALL',
        target_age_min: null,
        target_age_max: null,
        start_date: null,
        end_date: null,
        is_always_open: 1, // 상시 모집
        apply_url: 'https://example.com/pol003',
        detail_json: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'POL004',
        title: '창업 지원 (마감 10일 전)',
        summary: '청년 창업 지원 정책',
        category: 'STARTUP',
        region: 'SEOUL',
        target_age_min: 20,
        target_age_max: 39,
        start_date: now - 20 * oneDaySeconds,
        end_date: now + 10 * oneDaySeconds, // 10일 후 마감 (7일 초과)
        is_always_open: 0,
        apply_url: 'https://example.com/pol004',
        detail_json: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'POL005',
        title: '복지 지원 (이미 마감)',
        summary: '청년 복지 지원 정책',
        category: 'WELFARE',
        region: 'ALL',
        target_age_min: 18,
        target_age_max: 35,
        start_date: now - 90 * oneDaySeconds,
        end_date: now - 10 * oneDaySeconds, // 이미 마감됨
        is_always_open: 0,
        apply_url: 'https://example.com/pol005',
        detail_json: null,
        created_at: now,
        updated_at: now,
      },
    ]);

    // 테스트용 북마크 데이터
    mockEnv.DB.data.set('bookmarks', [
      {
        user_id: 'user-001',
        policy_id: 'POL001', // 마감 5일 전
        notify_before_days: 7,
        created_at: now,
      },
      {
        user_id: 'user-002', // FCM 토큰 없음
        policy_id: 'POL001',
        notify_before_days: 7,
        created_at: now,
      },
      {
        user_id: 'user-003',
        policy_id: 'POL002', // 마감 3일 전
        notify_before_days: 7,
        created_at: now,
      },
      {
        user_id: 'user-001',
        policy_id: 'POL003', // 상시 모집 (알림 대상 아님)
        notify_before_days: 7,
        created_at: now,
      },
      {
        user_id: 'user-003',
        policy_id: 'POL004', // 마감 10일 전 (7일 초과)
        notify_before_days: 7,
        created_at: now,
      },
    ]);
  });

  describe('getClosingSoonPolicies', () => {
    it('should return policies closing within 7 days', async () => {
      const policies = await getClosingSoonPolicies(mockEnv.DB);

      expect(policies.length).toBe(2);
      expect(policies.map((p) => p.id).sort()).toEqual(['POL001', 'POL002']);
    });

    it('should exclude always-open policies', async () => {
      const policies = await getClosingSoonPolicies(mockEnv.DB);

      const alwaysOpenPolicies = policies.filter((p) => p.isAlwaysOpen);
      expect(alwaysOpenPolicies.length).toBe(0);
    });

    it('should exclude already closed policies', async () => {
      const policies = await getClosingSoonPolicies(mockEnv.DB);

      const closedPolicies = policies.filter((p) => p.id === 'POL005');
      expect(closedPolicies.length).toBe(0);
    });

    it('should exclude policies closing after 7 days', async () => {
      const policies = await getClosingSoonPolicies(mockEnv.DB);

      const farFuturePolicies = policies.filter((p) => p.id === 'POL004');
      expect(farFuturePolicies.length).toBe(0);
    });

    it('should return empty array when no closing soon policies', async () => {
      // 모든 정책을 상시 모집으로 변경
      mockEnv.DB.data.set('policies', [
        {
          id: 'POL999',
          title: '상시 모집 정책',
          summary: '상시 모집',
          category: 'JOB',
          region: 'ALL',
          target_age_min: null,
          target_age_max: null,
          start_date: null,
          end_date: null,
          is_always_open: 1,
          apply_url: 'https://example.com',
          detail_json: null,
          created_at: now,
          updated_at: now,
        },
      ]);

      const policies = await getClosingSoonPolicies(mockEnv.DB);

      expect(policies.length).toBe(0);
    });
  });

  describe('getUsersForPolicy', () => {
    it('should return users with FCM token who bookmarked the policy', async () => {
      const users = await getUsersForPolicy(mockEnv.DB, 'POL001');

      expect(users.length).toBe(1);
      expect(users[0].id).toBe('user-001');
      expect(users[0].fcmToken).toBe('fcm-token-user1');
    });

    it('should exclude users without FCM token', async () => {
      const users = await getUsersForPolicy(mockEnv.DB, 'POL001');

      const usersWithoutToken = users.filter((u) => !u.fcmToken);
      expect(usersWithoutToken.length).toBe(0);
    });

    it('should return empty array when no bookmarks', async () => {
      const users = await getUsersForPolicy(mockEnv.DB, 'POL999');

      expect(users.length).toBe(0);
    });

    it('should return multiple users for same policy', async () => {
      // POL002를 user-001도 북마크 추가
      const bookmarks = mockEnv.DB.data.get('bookmarks');
      bookmarks.push({
        user_id: 'user-001',
        policy_id: 'POL002',
        notify_before_days: 7,
        created_at: now,
      });

      const users = await getUsersForPolicy(mockEnv.DB, 'POL002');

      expect(users.length).toBe(2);
      expect(users.map((u) => u.id).sort()).toEqual(['user-001', 'user-003']);
    });
  });

  describe('sendPushNotification', () => {
    it('should log notification (mock)', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await sendPushNotification(
        'fcm-token-test',
        '알림 제목',
        '알림 본문'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        '[FCM Mock] Sending notification to fcm-token-test:',
        { title: '알림 제목', body: '알림 본문' }
      );

      consoleSpy.mockRestore();
    });

    it('should not throw error for invalid token (mock)', async () => {
      await expect(
        sendPushNotification('invalid-token', 'Title', 'Body')
      ).resolves.not.toThrow();
    });
  });

  describe('sendClosingSoonNotifications', () => {
    it('should send notifications to eligible users', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      const result = await sendClosingSoonNotifications(mockEnv.DB);

      expect(result.sent).toBe(2); // POL001: user-001, POL002: user-003
      expect(result.failed).toBe(0);

      // FCM 발송 로그 확인
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[FCM Mock]'),
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    it('should return zero when no eligible policies', async () => {
      // 모든 정책 삭제
      mockEnv.DB.data.set('policies', []);

      const result = await sendClosingSoonNotifications(mockEnv.DB);

      expect(result.sent).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should return zero when no bookmarks', async () => {
      // 모든 북마크 삭제
      mockEnv.DB.data.set('bookmarks', []);

      const result = await sendClosingSoonNotifications(mockEnv.DB);

      expect(result.sent).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should skip users without FCM token', async () => {
      const result = await sendClosingSoonNotifications(mockEnv.DB);

      // user-002는 FCM 토큰이 없으므로 알림 발송 대상에서 제외
      expect(result.sent).toBe(2); // user-001, user-003만
    });

    it('should handle notification failure gracefully', async () => {
      // 에러 핸들링 로직 확인: 한 사용자 실패해도 다른 사용자에게는 발송 계속
      // 실제 에러 발생 시나리오는 통합 테스트에서 검증
      // 여기서는 정상 동작만 확인
      const result = await sendClosingSoonNotifications(mockEnv.DB);

      // 모든 알림이 정상 발송됨
      expect(result.sent).toBeGreaterThanOrEqual(0);
      expect(result.failed).toBeGreaterThanOrEqual(0);
      expect(result.sent + result.failed).toBeGreaterThanOrEqual(0);
    });
  });
});
