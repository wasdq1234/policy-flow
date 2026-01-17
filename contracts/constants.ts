// contracts/constants.ts
// BE/FE 간 일관성을 위해 모든 ENUM 값은 여기서 정의

// 정책 카테고리
export const POLICY_CATEGORIES = [
  'JOB', // 취업/창업
  'HOUSING', // 주거/생활
  'LOAN', // 금융/대출
  'EDUCATION', // 교육/장학
  'STARTUP', // 창업지원
  'WELFARE', // 복지/지원
] as const;

export type PolicyCategory = (typeof POLICY_CATEGORIES)[number];

// 지역
export const REGIONS = [
  'ALL', // 전국
  'SEOUL', // 서울
  'BUSAN', // 부산
  'DAEGU', // 대구
  'INCHEON', // 인천
  'GWANGJU', // 광주
  'DAEJEON', // 대전
  'ULSAN', // 울산
  'SEJONG', // 세종
  'GYEONGGI', // 경기
  'GANGWON', // 강원
  'CHUNGBUK', // 충북
  'CHUNGNAM', // 충남
  'JEONBUK', // 전북
  'JEONNAM', // 전남
  'GYEONGBUK', // 경북
  'GYEONGNAM', // 경남
  'JEJU', // 제주
] as const;

export type Region = (typeof REGIONS)[number];

// 정책 상태 (계산된 값)
export const POLICY_STATUSES = [
  'OPEN', // 접수중
  'CLOSING_SOON', // 마감임박 (7일 이내)
  'UPCOMING', // 오픈예정
  'CLOSED', // 마감됨
] as const;

export type PolicyStatus = (typeof POLICY_STATUSES)[number];

// 게시글 유형
export const POST_TYPES = ['TIP', 'QUESTION', 'REVIEW', 'GENERAL'] as const;

export type PostType = (typeof POST_TYPES)[number];

// 소셜 로그인 제공자
export const AUTH_PROVIDERS = ['google', 'kakao'] as const;

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

// 나이대
export const AGE_GROUPS = ['10s', '20s', '30s', '40s', '50s', '60s_plus'] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number];

// 정책 상태별 표시 정보
export const POLICY_STATUS_DISPLAY = {
  OPEN: { label: '접수중', color: 'green', bgColor: 'bg-green-100' },
  CLOSING_SOON: { label: '마감임박', color: 'orange', bgColor: 'bg-orange-100' },
  UPCOMING: { label: '오픈예정', color: 'blue', bgColor: 'bg-blue-100' },
  CLOSED: { label: '마감', color: 'gray', bgColor: 'bg-gray-100' },
} as const;
