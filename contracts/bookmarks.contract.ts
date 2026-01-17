// contracts/bookmarks.contract.ts
// 북마크 API 계약 정의

import type { UnixTimestamp } from './types';
import type { PolicyListItem } from './policies.contract';

/**
 * GET /api/v1/bookmarks
 * 내 북마크 목록 조회
 */
export interface BookmarkListItem {
  policyId: string;
  policy: PolicyListItem;
  notifyBeforeDays: number;
  createdAt: UnixTimestamp;
}

/**
 * POST /api/v1/bookmarks
 * 북마크 추가
 */
export interface CreateBookmarkRequest {
  policyId: string;
  notifyBeforeDays?: number; // 기본값: 3
}

export interface CreateBookmarkResponse {
  policyId: string;
  notifyBeforeDays: number;
  createdAt: UnixTimestamp;
}

/**
 * DELETE /api/v1/bookmarks/:policyId
 * 북마크 삭제
 * Response: 204 No Content
 */
