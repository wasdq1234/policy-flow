# PolicyFlow KR

> 모든 국민이 자신에게 해당하는 정책 자금을 단 1원도 놓치지 않도록 돕는 정책 캘린더 서비스

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (Static Export)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **HTTP Client**: fetch (native)
- **Testing**: Vitest + React Testing Library + Playwright

### Backend
- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Language**: TypeScript
- **ORM**: Drizzle ORM
- **Database**: Cloudflare D1 (SQLite)
- **Validation**: Zod
- **Testing**: Vitest + Miniflare

### Infrastructure
- **Hosting**: Cloudflare Pages (Frontend), Cloudflare Workers (Backend)
- **Database**: Cloudflare D1
- **Push Notifications**: Firebase Cloud Messaging
- **CI/CD**: GitHub Actions (예정)

## 프로젝트 구조

```
policy-flow/
├── contracts/          # 공유 타입 및 API 계약
│   ├── constants.ts    # 공통 상수 (ENUM)
│   ├── types.ts        # 공통 타입 정의
│   └── utils.ts        # 공유 유틸리티
├── frontend/           # Next.js 프론트엔드
│   ├── app/            # App Router 페이지
│   ├── components/     # 재사용 컴포넌트
│   ├── hooks/          # 커스텀 훅
│   ├── lib/            # 유틸리티
│   └── stores/         # Zustand 스토어
├── backend/            # Cloudflare Workers 백엔드
│   ├── src/
│   │   ├── index.ts    # 엔트리포인트
│   │   ├── routes/     # Hono 라우트
│   │   ├── services/   # 비즈니스 로직
│   │   ├── schemas/    # Zod 스키마
│   │   └── db/         # Drizzle ORM
│   └── wrangler.toml   # Cloudflare 설정
└── docs/               # 기획 문서
```

## 시작하기

### 사전 요구사항

- Node.js >= 18.0.0
- npm >= 9.0.0

### 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### 개발

```bash
# 프론트엔드 개발 서버 (http://localhost:3000)
npm run dev:fe

# 백엔드 개발 서버 (http://localhost:8787)
npm run dev:be
```

### 빌드

```bash
# 전체 빌드
npm run build

# 타입 체크
npm run type-check

# 린트
npm run lint

# 테스트
npm run test
```

## 개발 워크플로우

### TDD 사이클

```
🔴 RED    → 실패하는 테스트 먼저 작성
🟢 GREEN  → 테스트를 통과하는 최소한의 코드 구현
🔵 REFACTOR → 테스트 통과 유지하며 코드 개선
```

### Contract-First Development

1. **계약 정의** (`contracts/`)
2. **테스트 작성** (RED 상태)
3. **Mock 생성** (프론트엔드 독립 개발)
4. **병렬 구현** (BE/FE 동시 개발)
5. **통합 검증** (E2E 테스트)

## 배포

### 프론트엔드 (Cloudflare Pages)

```bash
cd frontend
npm run build
npx wrangler pages deploy out --project-name=policyflow
```

### 백엔드 (Cloudflare Workers)

```bash
cd backend
npx wrangler deploy
```

## 문서

- [PRD (제품 요구사항)](docs/planning/01-prd.md)
- [TRD (기술 요구사항)](docs/planning/02-trd.md)
- [사용자 플로우](docs/planning/03-user-flow.md)
- [데이터베이스 설계](docs/planning/04-database-design.md)
- [디자인 시스템](docs/planning/05-design-system.md)
- [작업 분해](docs/planning/06-tasks.md)
- [코딩 컨벤션](docs/planning/07-coding-convention.md)

## 라이선스

MIT
