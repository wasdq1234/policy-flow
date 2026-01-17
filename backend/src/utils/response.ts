/**
 * 표준 응답 헬퍼
 * TRD 섹션 8.2 응답 형식 준수
 */

/**
 * 페이지네이션 메타데이터
 */
export interface PaginationMeta {
  page: number;
  total: number;
  hasNext: boolean;
  perPage?: number;
}

/**
 * 성공 응답 타입
 */
export interface SuccessResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

/**
 * 에러 상세 정보
 */
export interface ErrorDetail {
  field: string;
  message: string;
}

/**
 * 에러 응답 타입
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
}

/**
 * 성공 응답 생성
 */
export function success<T>(data: T, meta?: PaginationMeta): SuccessResponse<T> {
  const response: SuccessResponse<T> = { data };

  if (meta) {
    response.meta = meta;
  }

  return response;
}

/**
 * 에러 응답 생성
 */
export function error(
  code: string,
  message: string,
  details?: ErrorDetail[]
): ErrorResponse {
  return {
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}

/**
 * 페이지네이션 메타데이터 생성
 */
export function createPaginationMeta(
  page: number,
  total: number,
  perPage: number
): PaginationMeta {
  return {
    page,
    total,
    hasNext: page * perPage < total,
    perPage,
  };
}
