# Coding Convention & AI Collaboration Guide: PolicyFlow KR

> Cloudflare Workers + Next.js 프로젝트를 위한 개발 규칙 및 AI 협업 지침

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

## 1. 핵심 원칙

### 1.1 신뢰하되, 검증하라 (Trust, but Verify)

AI가 생성한 코드는 반드시 검증해야 합니다:

- [ ] 코드 리뷰: 생성된 코드 직접 확인
- [ ] 테스트 실행: 자동화 테스트 통과 확인
- [ ] 보안 검토: 민감 정보 노출 여부 확인
- [ ] 동작 확인: 실제로 실행하여 기대 동작 확인

### 1.2 최종 책임은 인간에게

- AI는 도구이고, 최종 결정과 책임은 개발자에게 있습니다
- 이해하지 못하는 코드는 사용하지 않습니다
- 의심스러운 부분은 반드시 질문합니다

---

## 2. 프로젝트 구조

### 2.1 모노레포 디렉토리 구조

```
policyflow/
├── frontend/                    # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/                # App Router 페이지
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # 메인 (캘린더)
│   │   │   ├── community/      # 게시판
│   │   │   └── mypage/         # 마이페이지
│   │   ├── components/         # 재사용 컴포넌트
│   │   │   ├── ui/             # 기본 UI (Button, Input, Card)
│   │   │   ├── calendar/       # 캘린더 관련
│   │   │   ├── post/           # 게시판 관련
│   │   │   └── layout/         # 레이아웃 (Header, Footer, TabBar)
│   │   ├── hooks/              # 커스텀 훅
│   │   ├── lib/                # 유틸리티
│   │   │   ├── api.ts          # API 클라이언트
│   │   │   ├── auth.ts         # 인증 관련
│   │   │   └── utils.ts        # 헬퍼 함수
│   │   ├── stores/             # Zustand 스토어
│   │   ├── types/              # TypeScript 타입
│   │   └── mocks/              # MSW Mock 핸들러
│   │       ├── handlers/
│   │       └── data/
│   ├── public/
│   ├── __tests__/              # 프론트엔드 테스트
│   └── e2e/                    # E2E 테스트 (Playwright)
│
├── backend/                     # Cloudflare Workers 백엔드
│   ├── src/
│   │   ├── index.ts            # 엔트리포인트
│   │   ├── routes/             # Hono 라우트
│   │   │   ├── auth.ts
│   │   │   ├── policies.ts
│   │   │   ├── bookmarks.ts
│   │   │   └── posts.ts
│   │   ├── services/           # 비즈니스 로직
│   │   ├── schemas/            # Zod 스키마
│   │   ├── db/                 # Drizzle ORM
│   │   │   ├── schema.ts       # 테이블 정의
│   │   │   └── migrations/     # 마이그레이션
│   │   ├── cron/               # Cron Trigger 로직
│   │   │   └── sync-policies.ts
│   │   └── utils/              # 유틸리티
│   ├── __tests__/              # 백엔드 테스트
│   └── wrangler.toml           # Cloudflare 설정
│
├── contracts/                   # API 계약 (BE/FE 공유)
│   ├── types.ts                # 공통 타입
│   ├── auth.contract.ts
│   ├── policies.contract.ts
│   ├── bookmarks.contract.ts
│   └── posts.contract.ts
│
├── docs/
│   ├── planning/               # 기획 문서 (소크라테스 산출물)
│   │   ├── 01-prd.md
│   │   ├── 02-trd.md
│   │   ├── 03-user-flow.md
│   │   ├── 04-database-design.md
│   │   ├── 05-design-system.md
│   │   ├── 06-tasks.md
│   │   └── 07-coding-convention.md
│   └── requirements.md
│
├── .env.example                # 환경 변수 템플릿
├── package.json                # 루트 패키지 (워크스페이스)
└── turbo.json                  # Turborepo 설정 (선택)
```

### 2.2 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일 (컴포넌트) | PascalCase | `PolicyCard.tsx` |
| 파일 (유틸/훅) | camelCase | `useAuth.ts`, `formatDate.ts` |
| 파일 (라우트) | kebab-case | `policies.ts`, `sync-policies.ts` |
| 컴포넌트 | PascalCase | `PolicyCard`, `BookmarkButton` |
| 함수/변수 | camelCase | `getPolicies`, `isLoading` |
| 상수 | UPPER_SNAKE | `MAX_RETRY_COUNT`, `API_BASE_URL` |
| 타입/인터페이스 | PascalCase | `Policy`, `UserPreferences` |
| CSS 클래스 | Tailwind 유틸리티 | `flex items-center gap-2` |
| 환경 변수 | UPPER_SNAKE | `CLOUDFLARE_API_KEY` |

### 2.3 임포트 순서

```typescript
// 1. React/Next.js 관련
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. 외부 라이브러리
import { format } from 'date-fns';
import { create } from 'zustand';

// 3. 내부 모듈 (절대 경로)
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

// 4. 타입
import type { Policy } from '@/types';

// 5. 스타일 (해당 시)
import styles from './PolicyCard.module.css';
```

---

## 3. 아키텍처 원칙

### 3.1 뼈대 먼저 (Skeleton First)

1. 전체 구조를 먼저 잡고
2. 빈 함수/컴포넌트로 스켈레톤 생성
3. 하나씩 구현 채워나가기

### 3.2 작은 모듈로 분해

- 한 파일에 **200줄 이하** 권장
- 한 함수에 **50줄 이하** 권장
- 한 컴포넌트에 **150줄 이하** 권장

### 3.3 관심사 분리

| 레이어 | 역할 | 위치 |
|--------|------|------|
| UI 컴포넌트 | 화면 표시만 담당 | `components/` |
| 페이지 | 라우팅 + 데이터 패칭 | `app/` |
| 훅 | 상태 로직 캡슐화 | `hooks/` |
| 스토어 | 전역 상태 관리 | `stores/` |
| API | HTTP 통신 | `lib/api.ts` |
| 유틸 | 순수 함수 | `lib/utils.ts` |

### 3.4 컴포넌트 설계 원칙

```tsx
// 좋은 예: Props 명확, 단일 책임
interface PolicyCardProps {
  policy: Policy;
  onBookmark?: (id: string) => void;
}

export function PolicyCard({ policy, onBookmark }: PolicyCardProps) {
  return (
    <Card>
      <CardHeader>{policy.title}</CardHeader>
      <CardContent>{policy.summary}</CardContent>
      <CardFooter>
        <BookmarkButton onClick={() => onBookmark?.(policy.id)} />
      </CardFooter>
    </Card>
  );
}
```

---

## 4. AI 소통 원칙

### 4.1 하나의 채팅 = 하나의 작업

- 한 번에 하나의 명확한 작업만 요청
- 작업 완료 후 다음 작업 진행
- 컨텍스트가 길어지면 새 대화 시작

### 4.2 컨텍스트 명시

**좋은 예:**
```
TASKS 문서의 T2.1 "정책 목록 API 구현"을 진행해주세요.

참조:
- Database Design의 policies 테이블 스키마
- TRD의 API 설계 원칙 (RESTful, 응답 형식)
- contracts/policies.contract.ts

제약:
- Hono 프레임워크 사용
- Drizzle ORM으로 D1 연동
- Zod로 입력 검증
```

**나쁜 예:**
```
API 만들어줘
```

### 4.3 기존 코드 재사용

- 새로 만들기 전에 기존 코드 확인 요청
- 중복 코드 방지
- 일관성 유지

### 4.4 프롬프트 템플릿

```markdown
## 작업
{{무엇을 해야 하는지}}

## 참조 문서
- {{문서명}} 섹션 {{번호}}

## 기존 코드 참조
- {{파일 경로}}

## 제약 조건
- {{지켜야 할 것}}

## 예상 결과
- {{생성될 파일}}
- {{기대 동작}}
```

---

## 5. 보안 체크리스트

### 5.1 절대 금지

- [ ] 비밀정보 하드코딩 금지 (API 키, 비밀번호, 토큰)
- [ ] `.env` 파일 커밋 금지 (`.gitignore`에 포함)
- [ ] SQL 직접 문자열 조합 금지 (Drizzle ORM 사용)
- [ ] 사용자 입력 그대로 렌더링 금지 (XSS 방지)

### 5.2 필수 적용

- [ ] 모든 사용자 입력은 Zod로 서버 측 검증
- [ ] 비밀번호 해싱 (bcrypt)
- [ ] HTTPS 사용 (Cloudflare 자동 적용)
- [ ] CORS 설정 (Hono cors 미들웨어)
- [ ] 인증된 요청만 민감 API 접근 (JWT 검증)
- [ ] Rate Limiting (게시글/댓글 작성)

### 5.3 환경 변수 관리

```bash
# .env.example (커밋 O)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_D1_DATABASE_ID=your-database-id
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
JWT_SECRET=your-jwt-secret
FIREBASE_PROJECT_ID=your-firebase-project-id

# .env (커밋 X)
# 실제 값 입력
```

---

## 6. 테스트 워크플로우

### 6.1 TDD 사이클

```
🔴 RED    → 실패하는 테스트 먼저 작성
🟢 GREEN  → 테스트를 통과하는 최소한의 코드 구현
🔵 REFACTOR → 테스트 통과 유지하며 코드 개선
```

### 6.2 테스트 파일 구조

```
__tests__/
├── unit/                    # 단위 테스트
│   ├── utils.test.ts
│   └── components/
│       └── PolicyCard.test.tsx
├── integration/             # 통합 테스트
│   └── api/
│       └── policies.test.ts
└── e2e/                     # E2E 테스트
    └── calendar.spec.ts
```

### 6.3 테스트 명령어

```bash
# 백엔드 테스트
cd backend && npm run test           # 전체 테스트
cd backend && npm run test:watch     # 변경 감지 모드
cd backend && npm run test:coverage  # 커버리지 포함

# 프론트엔드 테스트
cd frontend && npm run test          # 전체 테스트
cd frontend && npm run test:watch    # 변경 감지 모드
cd frontend && npm run test:coverage # 커버리지 포함

# E2E 테스트
cd frontend && npm run test:e2e      # Playwright 실행
```

### 6.4 오류 로그 공유 규칙

오류 발생 시 AI에게 전달할 정보:

1. **전체 에러 메시지** (스택 트레이스 포함)
2. **관련 코드 스니펫**
3. **재현 단계**
4. **이미 시도한 해결책**

**예시:**
```markdown
## 에러
TypeError: Cannot read property 'id' of undefined
at getPolicyById (policies.ts:42)

## 코드
const policy = await db.query.policies.findFirst({ where: eq(id, policyId) });
return { id: policy.id, title: policy.title };  // line 42

## 재현
1. GET /api/v1/policies/nonexistent-id 요청
2. 존재하지 않는 ID 전달

## 시도한 것
- policy가 undefined인 것 확인
- findFirst가 없으면 undefined 반환하는 것 확인
```

---

## 7. Git 워크플로우

### 7.1 브랜치 전략

```
main              # 프로덕션 배포
├── develop       # 개발 통합 (선택)
│   ├── feature/feat-0-auth
│   ├── feature/feat-1-calendar
│   ├── feature/feat-2-bookmark
│   ├── feature/feat-3-community
│   └── fix/policy-date-parsing
```

### 7.2 브랜치 네이밍

| 타입 | 패턴 | 예시 |
|------|------|------|
| 기능 | `feature/feat-{번호}-{설명}` | `feature/feat-1-calendar` |
| 버그 | `fix/{설명}` | `fix/date-parsing-error` |
| 리팩토링 | `refactor/{설명}` | `refactor/api-structure` |
| 문서 | `docs/{설명}` | `docs/api-documentation` |

### 7.3 커밋 메시지

```
<type>(<scope>): <subject>

<body>
```

**타입:**
| 타입 | 설명 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 (기능 변경 없음) |
| `docs` | 문서 수정 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드, 설정 등 |
| `style` | 코드 스타일 (포맷팅) |

**예시:**
```
feat(calendar): 정책 캘린더 월간 뷰 구현

- FullCalendar 라이브러리 연동
- 정책 이벤트 바 컴포넌트 추가
- 필터링 연동
- TRD 섹션 5.2 구현 완료
```

### 7.4 PR 템플릿

```markdown
## 작업 내용
- TASKS.md T1.1 구현

## 변경 사항
- [ ] 새 파일 추가: `frontend/src/components/calendar/CalendarView.tsx`
- [ ] 수정: `frontend/src/app/page.tsx`

## 테스트
- [ ] 단위 테스트 통과
- [ ] E2E 테스트 통과

## 스크린샷 (UI 변경 시)

## 체크리스트
- [ ] 린트 통과
- [ ] 타입 체크 통과
- [ ] 테스트 커버리지 80% 이상
```

---

## 8. 코드 품질 도구

### 8.1 필수 설정

| 도구 | 프론트엔드 | 백엔드 |
|------|-----------|--------|
| 린터 | ESLint | ESLint |
| 포매터 | Prettier | Prettier |
| 타입 체크 | TypeScript (strict) | TypeScript (strict) |

### 8.2 ESLint 설정

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
  },
};
```

### 8.3 Prettier 설정

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 8.4 TypeScript 설정

```json
// tsconfig.json (공통)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 8.5 Pre-commit 훅 (Husky + lint-staged)

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## 9. 배포 워크플로우

### 9.1 Cloudflare 배포

**프론트엔드 (Pages):**
```bash
cd frontend
npm run build
npx wrangler pages deploy out --project-name=policyflow
```

**백엔드 (Workers):**
```bash
cd backend
npm run build
npx wrangler deploy
```

### 9.2 D1 마이그레이션

```bash
# 로컬 마이그레이션 생성
cd backend
npx drizzle-kit generate:sqlite

# 원격 D1에 마이그레이션 적용
npx wrangler d1 execute policy-db --file=./drizzle/0001_initial.sql --remote
```

### 9.3 환경별 설정

| 환경 | 프론트엔드 | 백엔드 | D1 |
|------|-----------|--------|-----|
| 로컬 | `npm run dev` | `wrangler dev` | 로컬 SQLite |
| 프리뷰 | Pages Preview | Workers Preview | D1 Preview |
| 프로덕션 | Pages Production | Workers Production | D1 Production |

---

## 10. 성능 최적화 가이드

### 10.1 프론트엔드

- [ ] 이미지 최적화 (`next/image`)
- [ ] 코드 스플리팅 (동적 import)
- [ ] 불필요한 리렌더링 방지 (`React.memo`, `useMemo`)
- [ ] 번들 크기 모니터링 (`@next/bundle-analyzer`)

### 10.2 백엔드 (Workers)

- [ ] CPU 시간 최소화 (10ms 제한)
- [ ] KV 캐싱 활용 (정책 목록)
- [ ] 쿼리 최적화 (필요한 컬럼만 SELECT)
- [ ] 페이지네이션 적용

### 10.3 D1 최적화

- [ ] 인덱스 활용 (자주 검색하는 컬럼)
- [ ] 배치 쓰기 (여러 INSERT를 하나의 트랜잭션으로)
- [ ] 불필요한 데이터 정리 (Cron)

---

## Decision Log

| # | 결정 | 이유 |
|---|------|------|
| 1 | 모노레포 구조 (contracts 공유) | BE/FE 타입 동기화, 계약 기반 개발 |
| 2 | Turborepo 미사용 (MVP) | 복잡도 감소, 단일 개발자 환경 |
| 3 | Husky + lint-staged | 커밋 전 품질 보장 |
| 4 | Vitest (Jest 대신) | 빠른 실행, ESM 네이티브 지원 |
| 5 | strict TypeScript | 런타임 에러 사전 방지 |
