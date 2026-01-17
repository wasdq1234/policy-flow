/**
 * 정책 상태 계산 유틸리티
 * TRD 7.6 - 정책 상태는 서버에서 계산
 */
import type { PolicyStatus } from '../../../contracts/types';

/**
 * 정책 상태 계산
 * @param startDate Unix timestamp (seconds) or null
 * @param endDate Unix timestamp (seconds) or null
 * @param isAlwaysOpen 상시 모집 여부
 * @returns PolicyStatus
 */
export function calculatePolicyStatus(
  startDate: number | null,
  endDate: number | null,
  isAlwaysOpen: boolean
): PolicyStatus {
  // 상시 모집 정책은 항상 OPEN
  if (isAlwaysOpen) {
    return 'OPEN';
  }

  // 현재 시간 (Unix timestamp, seconds)
  const now = Math.floor(Date.now() / 1000);

  // 시작일이 미래 = 오픈 예정
  if (startDate && now < startDate) {
    return 'UPCOMING';
  }

  // 종료일이 과거 = 마감됨
  if (endDate && now > endDate) {
    return 'CLOSED';
  }

  // 종료일이 7일 이내 = 마감 임박
  if (endDate) {
    const daysLeft = (endDate - now) / 86400; // 86400 = 1일(초)
    if (daysLeft <= 7) {
      return 'CLOSING_SOON';
    }
  }

  // 나머지 = 접수 중
  return 'OPEN';
}
