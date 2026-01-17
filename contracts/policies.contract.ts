// contracts/policies.contract.ts
// 정책 API 계약 정의

import type {
  PolicyCategory,
  Region,
  PolicyStatus,
  UnixTimestamp,
} from './types';

/**
 * GET /api/v1/policies
 * 정책 목록 조회 (필터링, 페이지네이션)
 */
export interface GetPoliciesQuery {
  page?: number;
  limit?: number;
  region?: Region;
  category?: PolicyCategory;
  status?: PolicyStatus;
  search?: string; // 제목, 요약 검색
}

export interface PolicyListItem {
  id: string;
  title: string;
  summary: string | null;
  category: PolicyCategory;
  region: Region;
  status: PolicyStatus; // 계산된 값
  startDate: UnixTimestamp | null;
  endDate: UnixTimestamp | null;
  isAlwaysOpen: boolean;
}

/**
 * GET /api/v1/policies/:id
 * 정책 상세 조회
 */
export interface PolicyDetail extends PolicyListItem {
  applyUrl: string | null;
  targetAgeMin: number | null;
  targetAgeMax: number | null;
  detailJson: string | null; // JSON string
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
}
