// contracts/utils.ts
// 공유 유틸리티 함수

import type { UnixTimestamp, PolicyStatus } from './types';

/**
 * 정책 상태 계산 로직
 * @param startDate - 신청 시작일 (Unix timestamp, 초)
 * @param endDate - 신청 마감일 (Unix timestamp, 초)
 * @param isAlwaysOpen - 상시 접수 여부
 * @returns PolicyStatus
 */
export function calculatePolicyStatus(
  startDate: UnixTimestamp | null,
  endDate: UnixTimestamp | null,
  isAlwaysOpen: boolean
): PolicyStatus {
  // 상시 접수는 항상 OPEN
  if (isAlwaysOpen) return 'OPEN';

  const now = Math.floor(Date.now() / 1000); // 현재 시간 (초)

  // 시작일이 미래면 UPCOMING
  if (startDate && startDate > now) return 'UPCOMING';

  // 마감일 체크
  if (endDate) {
    // 이미 마감됨
    if (endDate < now) return 'CLOSED';

    // 마감 7일 이내면 CLOSING_SOON
    const SEVEN_DAYS = 7 * 24 * 60 * 60;
    if (endDate - now <= SEVEN_DAYS) return 'CLOSING_SOON';
  }

  // 기본값: 접수중
  return 'OPEN';
}

/**
 * Unix timestamp를 JavaScript Date로 변환
 * @param ts - Unix timestamp (초)
 * @returns Date 객체
 */
export function fromUnixTimestamp(ts: UnixTimestamp): Date {
  return new Date(ts * 1000);
}

/**
 * JavaScript Date를 Unix timestamp로 변환
 * @param date - Date 객체
 * @returns Unix timestamp (초)
 */
export function toUnixTimestamp(date: Date): UnixTimestamp {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Unix timestamp를 포맷된 문자열로 변환
 * @param ts - Unix timestamp (초)
 * @param format - 'short' | 'long'
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(
  ts: UnixTimestamp,
  format: 'short' | 'long' = 'short'
): string {
  const date = fromUnixTimestamp(ts);
  if (format === 'short') {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
