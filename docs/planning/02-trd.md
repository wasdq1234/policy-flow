# TRD (기술 요구사항 정의서): PolicyFlow KR

> Cloudflare-Native 서버리스 아키텍처 기반 정책 캘린더 서비스

---

## MVP 캡슐

| # | 항목 | 내용 |
|---|------|------|
| 1 | 목표 | 모든 국민이 자신에게 해당하는 정책 자금을 단 1원도 놓치지 않도록 돕는다 |
| 2 | 페르소나 | 취업준비생 김민수(26세), 소상공인 이영희(45세) |
| 3 | 핵심 기능 | FEAT-1: 정책 캘린더 (맞춤형 정책 시각화) |
| 4 | 성공 지표 (노스스타) | MAU 10,000명 |
| 5 | 입력 지표 | 북마크 정책 수, 푸시 알림 허용률 |
| 6 | 비기능 요구 | 서버 비용 0원 (Cloudflare 무료 티어) |
| 7 | Out-of-scope | 다크모드, 모바일 앱, 정책 신청 대행 |
| 8 | Top 리스크 | 공공 API 변경/중단 시 데이터 수집 불가 |
| 9 | 완화/실험 | Health Check Worker + 사용자 제보 시스템 |
| 10 | 다음 단계 | Cloudflare 계정 세팅 및 D1 데이터베이스 생성 |

---

## 1. 시스템 아키텍처

### 1.1 고수준 아키텍처

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Cloudflare    │     │   Cloudflare    │     │   Cloudflare    │
│     Pages       │────▶│    Workers      │────▶│       D1        │
│   (Frontend)    │     │   (Backend)     │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       ▼                       │
        │               ┌─────────────────┐             │
        │               │  Cron Trigger   │─────────────┘
        │               │ (Data Ingestion)│
        │               └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Firebase      │     │  Public APIs    │
│     (FCM)       │     │ (청년센터 등)    │
└─────────────────┘     └─────────────────┘
```

### 1.2 컴포넌트 설명

| 컴포넌트 | 역할 | 왜 이 선택? |
|----------|------|-------------|
| Cloudflare Pages | 정적 프론트엔드 호스팅 | 무료 대역폭 무제한, 글로벌 엣지 배포 |
| Cloudflare Workers | API 서버, 비즈니스 로직 | 일일 10만 요청 무료, 콜드 스타트 없음 |
| Cloudflare D1 | SQLite 기반 엣지 DB | 500MB 무료, SQL 지원, 낮은 지연시간 |
| Cron Triggers | 주기적 데이터 수집 | Workers에 포함, 추가 비용 없음 |
| Firebase FCM | 웹 푸시 알림 발송 | 무료 무제한, 안정적인 전송률 |

---

## 2. 권장 기술 스택

### 2.1 프론트엔드

| 항목 | 선택 | 이유 | 벤더 락인 리스크 |
|------|------|------|-----------------|
| 프레임워크 | Next.js 14 (Static Export) | Cloudflare Pages 호환, React 생태계 | 낮음 |
| 언어 | TypeScript | 타입 안정성, 자동완성 | - |
| 스타일링 | TailwindCSS | 빠른 개발, 번들 크기 최적화 | 낮음 |
| 상태관리 | Zustand | 간결함, 보일러플레이트 최소 | 낮음 |
| HTTP 클라이언트 | fetch (native) | 추가 의존성 없음 | 없음 |
| 캘린더 라이브러리 | FullCalendar / react-calendar | 커스터마이징 용이, 반응형 지원 | 낮음 |

### 2.2 백엔드

| 항목 | 선택 | 이유 | 벤더 락인 리스크 |
|------|------|------|-----------------|
| 런타임 | Cloudflare Workers | 0원 운영, 엣지 성능 | 중간 (Hono로 완화) |
| 프레임워크 | Hono | Workers 최적화, Express 유사 API | 낮음 |
| 언어 | TypeScript | FE와 타입 공유 가능 | - |
| ORM | Drizzle ORM | D1 네이티브 지원, 타입 안전 | 낮음 |
| 검증 | Zod | 런타임 + 타입 검증 통합 | 낮음 |

### 2.3 데이터베이스

| 항목 | 선택 | 이유 |
|------|------|------|
| 메인 DB | Cloudflare D1 | SQLite 호환, 500MB 무료, 엣지 지연시간 |
| 캐시 | Workers KV (선택) | 정책 목록 캐싱, 읽기 최적화 |

### 2.4 인프라

| 항목 | 선택 | 이유 |
|------|------|------|
| 프론트엔드 배포 | Cloudflare Pages | GitHub 연동 자동 배포 |
| 백엔드 배포 | Cloudflare Workers | wrangler CLI 배포 |
| 도메인 | Cloudflare DNS | 무료 SSL, 통합 관리 |
| 푸시 알림 | Firebase Cloud Messaging | 무료, 크로스 브라우저 지원 |

---

## 3. 비기능 요구사항

### 3.1 성능

| 항목 | 요구사항 | 측정 방법 |
|------|----------|----------|
| API 응답 시간 | < 200ms (P95) | Workers 로그 |
| 초기 로딩 | < 2s (FCP) | Lighthouse |
| 캘린더 렌더링 | < 100ms | 브라우저 Performance API |

### 3.2 보안

| 항목 | 요구사항 |
|------|----------|
| 인증 | 기기 UUID + 소셜 로그인 (OAuth 2.0) |
| 세션 | JWT (Access Token 1시간, Refresh Token 7일) |
| HTTPS | Cloudflare 자동 적용 |
| 입력 검증 | Zod 스키마로 서버 측 필수 검증 |
| Rate Limiting | 게시글 1분 간격, 댓글 10초 간격 |

### 3.3 확장성

| 항목 | 현재 (MVP) | 목표 (v2) |
|------|-----------|----------|
| 동시 사용자 | 1,000명 | 10,000명 |
| 정책 데이터 | 5,000건 | 50,000건 |
| 게시글 | 10,000건 | 100,000건 |

---

## 4. 외부 API 연동

### 4.1 인증

| 서비스 | 용도 | 필수/선택 | 연동 방식 |
|--------|------|----------|----------|
| Google OAuth | 소셜 로그인 | 필수 | OAuth 2.0 |
| Kakao OAuth | 소셜 로그인 | 필수 | OAuth 2.0 |

### 4.2 데이터 수집

| 서비스 | 용도 | 필수/선택 | 비고 |
|--------|------|----------|------|
| 온라인 청년센터 API | 청년 정책 데이터 | 필수 | 인증키 필요, 페이지네이션 지원 |
| 기업마당 (Bizinfo) | 소상공인 정책 | 선택 | RSS/API 품질 확인 필요 |
| 공공데이터포털 | 보조 데이터 | 선택 | 트래픽 제한 엄격 |

### 4.3 알림

| 서비스 | 용도 | 필수/선택 | 비고 |
|--------|------|----------|------|
| Firebase Cloud Messaging | 웹 푸시 발송 | 필수 | 무료 무제한 |

---

## 5. 접근제어 / 권한 모델

### 5.1 역할 정의

| 역할 | 설명 | 권한 |
|------|------|------|
| Guest | 비로그인 | 정책 목록/상세 조회, 게시판 읽기 |
| User | 로그인 사용자 | Guest + 북마크, 게시글/댓글 작성, 푸시 설정 |
| Admin | 관리자 | User + 게시글 삭제, 사용자 제재 |

### 5.2 권한 매트릭스

| 리소스 | Guest | User | Admin |
|--------|-------|------|-------|
| 정책 목록 조회 | O | O | O |
| 정책 상세 조회 | O | O | O |
| 정책 북마크 | - | O (본인) | O |
| 게시글 조회 | O | O | O |
| 게시글 작성 | - | O | O |
| 게시글 수정 | - | O (본인) | O |
| 게시글 삭제 | - | O (본인) | O |
| 댓글 작성 | - | O | O |
| 좋아요 | - | O | O |
| 푸시 설정 | - | O (본인) | O |

---

## 6. 데이터 생명주기

### 6.1 원칙

- **최소 수집**: 기기 토큰, 추상화된 인구통계(나이대, 지역)만 저장
- **명시적 동의**: 푸시 알림 권한 요청 시 명시
- **익명성 유지**: 주민등록번호, 실명, 전화번호 수집 안 함

### 6.2 데이터 흐름

```
수집 → 저장 → 사용 → 보관 → 삭제/익명화
```

| 데이터 유형 | 보존 기간 | 삭제/익명화 |
|------------|----------|------------|
| 사용자 설정 | 계정과 동일 | 탈퇴 시 즉시 삭제 |
| 북마크 | 계정과 동일 | 탈퇴 시 즉시 삭제 |
| 게시글/댓글 | 영구 | 익명화 유지 (작성자 정보 분리) |
| 정책 데이터 | 마감 후 1년 | 아카이빙 후 삭제 |
| FCM 토큰 | 갱신 시까지 | 무효화 시 삭제 |

---

## 7. 테스트 전략 (Contract-First TDD)

### 7.1 개발 방식: Contract-First Development

```
┌─────────────────────────────────────────────────────────────┐
│                    Contract-First 흐름                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 계약 정의 (Phase 0)                                     │
│     ├─ API 계약: contracts/*.contract.ts                   │
│     ├─ BE 스키마: backend/src/schemas/*.ts                 │
│     └─ 타입 동기화: Zod ↔ TypeScript                       │
│                                                             │
│  2. 테스트 선행 작성 (RED)                                  │
│     ├─ BE 테스트: backend/__tests__/**/*.test.ts           │
│     ├─ FE 테스트: frontend/src/__tests__/**/*.test.ts      │
│     └─ 모든 테스트가 실패하는 상태 (정상!)                  │
│                                                             │
│  3. Mock 생성 (FE 독립 개발용)                              │
│     └─ MSW 핸들러: frontend/src/mocks/handlers/*.ts        │
│                                                             │
│  4. 병렬 구현 (RED→GREEN)                                   │
│     ├─ BE: 테스트 통과 목표로 구현                          │
│     └─ FE: Mock API로 개발 → 나중에 실제 API 연결          │
│                                                             │
│  5. 통합 검증                                               │
│     └─ Mock 제거 → E2E 테스트                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 테스트 피라미드

| 레벨 | 도구 | 커버리지 목표 | 위치 |
|------|------|-------------|------|
| Unit | Vitest | >= 80% | `**/__tests__/` |
| Integration | Vitest + MSW | Critical paths | `**/__tests__/integration/` |
| E2E | Playwright | Key user flows | `e2e/` |

### 7.3 테스트 도구

**백엔드 (Workers):**
| 도구 | 용도 |
|------|------|
| Vitest | 테스트 실행 |
| Miniflare | Workers 로컬 에뮬레이션 |
| drizzle-kit | DB 마이그레이션 테스트 |

**프론트엔드:**
| 도구 | 용도 |
|------|------|
| Vitest | 테스트 실행 |
| React Testing Library | 컴포넌트 테스트 |
| MSW (Mock Service Worker) | API 모킹 |
| Playwright | E2E 테스트 |

### 7.4 계약 파일 구조

```
policyflow/
├── contracts/                    # API 계약 (BE/FE 공유)
│   ├── types.ts                 # 공통 타입 정의
│   ├── constants.ts             # 공유 상수 (ENUM 값)
│   ├── auth.contract.ts         # 인증 API 계약
│   ├── policies.contract.ts     # 정책 API 계약
│   ├── bookmarks.contract.ts    # 북마크 API 계약
│   └── posts.contract.ts        # 게시판 API 계약
│
├── backend/
│   ├── src/
│   │   ├── schemas/             # Zod 스키마 (계약과 동기화)
│   │   ├── routes/              # Hono 라우트
│   │   └── services/            # 비즈니스 로직
│   └── __tests__/
│       └── api/                 # API 테스트
│
└── frontend/
    ├── src/
    │   ├── mocks/
    │   │   ├── handlers/        # MSW Mock 핸들러
    │   │   └── data/            # Mock 데이터
    │   └── __tests__/
    └── e2e/                     # E2E 테스트
```

### 7.5 공유 상수 정의 (contracts/constants.ts)

BE/FE 간 일관성을 위해 모든 ENUM 값은 contracts/constants.ts에서 정의합니다.

```typescript
// contracts/constants.ts

// 정책 카테고리
export const POLICY_CATEGORIES = [
  'JOB',       // 취업/창업
  'HOUSING',   // 주거/생활
  'LOAN',      // 금융/대출
  'EDUCATION', // 교육/장학
  'STARTUP',   // 창업지원
  'WELFARE',   // 복지/지원
] as const;

export type PolicyCategory = typeof POLICY_CATEGORIES[number];

// 지역
export const REGIONS = [
  'ALL',       // 전국
  'SEOUL',     // 서울
  'BUSAN',     // 부산
  'DAEGU',     // 대구
  'INCHEON',   // 인천
  'GWANGJU',   // 광주
  'DAEJEON',   // 대전
  'ULSAN',     // 울산
  'SEJONG',    // 세종
  'GYEONGGI',  // 경기
  'GANGWON',   // 강원
  'CHUNGBUK',  // 충북
  'CHUNGNAM',  // 충남
  'JEONBUK',   // 전북
  'JEONNAM',   // 전남
  'GYEONGBUK', // 경북
  'GYEONGNAM', // 경남
  'JEJU',      // 제주
] as const;

export type Region = typeof REGIONS[number];

// 정책 상태 (계산된 값)
export const POLICY_STATUSES = [
  'OPEN',         // 접수중
  'CLOSING_SOON', // 마감임박 (7일 이내)
  'UPCOMING',     // 오픈예정
  'CLOSED',       // 마감됨
] as const;

export type PolicyStatus = typeof POLICY_STATUSES[number];

// 게시글 유형
export const POST_TYPES = [
  'tip',      // 꿀팁
  'question', // 질문
  'review',   // 후기
  'general',  // 일반
] as const;

export type PostType = typeof POST_TYPES[number];

// 소셜 로그인 제공자
export const AUTH_PROVIDERS = ['google', 'kakao'] as const;
export type AuthProvider = typeof AUTH_PROVIDERS[number];
```

### 7.6 정책 상태 계산 로직

정책 상태(status)는 DB에 저장하지 않고, 조회 시점에 계산합니다.

```typescript
// contracts/policies.contract.ts

import { PolicyStatus } from './constants';

/** Unix timestamp (초 단위) */
export type UnixTimestamp = number;

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
 * 정책 상태별 표시 정보
 */
export const POLICY_STATUS_DISPLAY = {
  OPEN: { label: '접수중', color: 'green', bgColor: 'bg-green-100' },
  CLOSING_SOON: { label: '마감임박', color: 'orange', bgColor: 'bg-orange-100' },
  UPCOMING: { label: '오픈예정', color: 'blue', bgColor: 'bg-blue-100' },
  CLOSED: { label: '마감', color: 'gray', bgColor: 'bg-gray-100' },
} as const;
```

### 7.7 타임스탬프 변환 유틸리티

BE(D1)는 Unix timestamp(초), FE(JavaScript)는 밀리초를 사용합니다.

```typescript
// contracts/types.ts

/** Unix timestamp in seconds (DB 저장 형식) */
export type UnixTimestamp = number;

// frontend/src/lib/date-utils.ts (FE 유틸리티)
export function fromUnixTimestamp(ts: UnixTimestamp): Date {
  return new Date(ts * 1000);
}

export function toUnixTimestamp(date: Date): UnixTimestamp {
  return Math.floor(date.getTime() / 1000);
}

export function formatDate(ts: UnixTimestamp, format: 'short' | 'long' = 'short'): string {
  const date = fromUnixTimestamp(ts);
  if (format === 'short') {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}
```

### 7.8 TDD 사이클

```
🔴 RED    → 실패하는 테스트 먼저 작성
🟢 GREEN  → 테스트를 통과하는 최소한의 코드 구현
🔵 REFACTOR → 테스트 통과 유지하며 코드 개선
```

### 7.9 품질 게이트

**병합 전 필수 통과:**
- [ ] 모든 단위 테스트 통과
- [ ] 커버리지 >= 80%
- [ ] 린트 통과 (ESLint)
- [ ] 타입 체크 통과 (tsc)
- [ ] E2E 테스트 통과 (해당 기능)

**검증 명령어:**
```bash
# 백엔드
cd backend && npm run test -- --coverage
npm run lint
npm run type-check

# 프론트엔드
cd frontend && npm run test -- --coverage
npm run lint
npm run type-check

# E2E
npx playwright test
```

---

## 8. API 설계 원칙

### 8.1 RESTful 규칙

| 메서드 | 용도 | 예시 |
|--------|------|------|
| GET | 조회 | GET /api/policies |
| POST | 생성 | POST /api/posts |
| PUT | 전체 수정 | PUT /api/users/:id/preferences |
| PATCH | 부분 수정 | PATCH /api/posts/:id |
| DELETE | 삭제 | DELETE /api/bookmarks/:id |

### 8.2 응답 형식

**성공 응답:**
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "total": 100,
    "hasNext": true
  }
}
```

**에러 응답:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": [
      { "field": "title", "message": "제목은 필수입니다" }
    ]
  }
}
```

### 8.3 API 버저닝

| 방식 | 예시 | 채택 여부 |
|------|------|----------|
| URL 경로 | /api/v1/policies | 권장 (채택) |

### 8.4 주요 엔드포인트

```
# 인증
POST   /api/v1/auth/login          # 소셜 로그인
POST   /api/v1/auth/refresh        # 토큰 갱신
DELETE /api/v1/auth/logout         # 로그아웃

# 정책
GET    /api/v1/policies            # 정책 목록 (필터링, 페이지네이션)
GET    /api/v1/policies/:id        # 정책 상세

# 사용자
GET    /api/v1/users/me            # 내 정보
PUT    /api/v1/users/me/preferences # 설정 저장
POST   /api/v1/users/me/push-token # FCM 토큰 등록

# 북마크
GET    /api/v1/bookmarks           # 내 북마크 목록
POST   /api/v1/bookmarks           # 북마크 추가
DELETE /api/v1/bookmarks/:policyId # 북마크 삭제

# 게시판
GET    /api/v1/posts               # 게시글 목록 (정책별 필터)
POST   /api/v1/posts               # 게시글 작성
GET    /api/v1/posts/:id           # 게시글 상세
PATCH  /api/v1/posts/:id           # 게시글 수정
DELETE /api/v1/posts/:id           # 게시글 삭제
POST   /api/v1/posts/:id/like      # 좋아요

# 댓글
GET    /api/v1/posts/:id/comments  # 댓글 목록
POST   /api/v1/posts/:id/comments  # 댓글 작성
DELETE /api/v1/comments/:id        # 댓글 삭제
```

---

## 9. 병렬 개발 지원 (Git Worktree)

### 9.1 개요

BE/FE를 완전히 독립된 환경에서 병렬 개발할 때 Git Worktree를 사용합니다.

### 9.2 Worktree 구조

```
~/projects/
├── policyflow/                # 메인 (main 브랜치)
├── policyflow-auth-be/        # Worktree: feature/auth-be
├── policyflow-auth-fe/        # Worktree: feature/auth-fe
├── policyflow-calendar-be/    # Worktree: feature/calendar-be
└── policyflow-calendar-fe/    # Worktree: feature/calendar-fe
```

### 9.3 명령어

```bash
# Worktree 생성
git worktree add ../policyflow-auth-be -b feature/auth-be
git worktree add ../policyflow-auth-fe -b feature/auth-fe

# 각 Worktree에서 독립 작업
cd ../policyflow-auth-be && npm run test
cd ../policyflow-auth-fe && npm run test

# 테스트 통과 후 병합
git checkout main
git merge --no-ff feature/auth-be
git merge --no-ff feature/auth-fe

# Worktree 정리
git worktree remove ../policyflow-auth-be
git worktree remove ../policyflow-auth-fe
```

### 9.4 병합 규칙

| 조건 | 병합 가능 |
|------|----------|
| 단위 테스트 통과 (GREEN) | 필수 |
| 커버리지 >= 80% | 필수 |
| 린트/타입 체크 통과 | 필수 |
| E2E 테스트 통과 | 권장 |

---

## Decision Log

| # | 결정 | 이유 | 대안 |
|---|------|------|------|
| 1 | Hono 프레임워크 | Workers 최적화, 경량, Express 유사 | itty-router |
| 2 | Drizzle ORM | D1 네이티브, 타입 안전, 경량 | Prisma (무거움) |
| 3 | Zustand 상태관리 | 보일러플레이트 최소, 간결함 | Redux Toolkit |
| 4 | 단일 레포지토리 | MVP 단계 빠른 개발, 타입 공유 용이 | Monorepo (Turborepo) |
| 5 | Static Export | Cloudflare Pages 무료 티어 최적 | SSR (유료 필요) |
