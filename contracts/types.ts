// contracts/types.ts
// 공통 타입 정의

import type { PolicyCategory, Region, PostType, AuthProvider } from './constants';
import type { PolicyStatus } from './constants';

// Re-export for convenience
export type { PolicyCategory, Region, PolicyStatus, PostType, AuthProvider };

/** Unix timestamp in seconds (DB 저장 형식) */
export type UnixTimestamp = number;

/** ISO 8601 날짜 문자열 */
export type DateString = string;

/** 정책 엔티티 */
export interface Policy {
  id: string;
  title: string;
  summary: string | null;
  category: PolicyCategory;
  region: Region;
  startDate: UnixTimestamp | null;
  endDate: UnixTimestamp | null;
  isAlwaysOpen: boolean;
  url: string | null;
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
}

/** 정책 상태 계산 포함 (FE/BE에서 사용) */
export interface PolicyWithStatus extends Policy {
  status: PolicyStatus;
}

/** 사용자 엔티티 */
export interface User {
  id: string;
  email: string | null;
  displayName: string;
  provider: AuthProvider;
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
}

/** 사용자 설정 */
export interface UserPreferences {
  userId: string;
  categories: PolicyCategory[];
  regions: Region[];
  pushEnabled: boolean;
}

/** 북마크 엔티티 */
export interface Bookmark {
  id: string;
  userId: string;
  policyId: string;
  createdAt: UnixTimestamp;
}

/** 게시글 엔티티 */
export interface Post {
  id: string;
  userId: string;
  policyId: string | null;
  type: PostType;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
}

/** 댓글 엔티티 */
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
}

/** API 공통 응답 형식 */
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasNext?: boolean;
  };
}

/** API 에러 응답 형식 */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field?: string;
      message: string;
    }>;
  };
}

/** 페이지네이션 파라미터 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** 정책 필터링 파라미터 */
export interface PolicyFilterParams extends PaginationParams {
  category?: PolicyCategory;
  region?: Region;
  status?: PolicyStatus;
  search?: string;
}
