# PolicyFlow KR - Deployment Guide

## Overview

PolicyFlow KR는 Cloudflare의 서버리스 플랫폼을 사용합니다:
- **Frontend**: Cloudflare Pages (Next.js Static Export)
- **Backend**: Cloudflare Workers (Hono.js)
- **Database**: Cloudflare D1 (SQLite)

---

## Prerequisites

### 1. Cloudflare 계정 설정
- [Cloudflare Dashboard](https://dash.cloudflare.com) 계정 생성
- API Token 생성 (권한: Workers, Pages, D1)

### 2. 필수 도구 설치
```bash
npm install -g wrangler
wrangler login
```

### 3. GitHub Secrets 설정
다음 Secrets를 GitHub Repository Settings에 추가:

| Secret Name | Description |
|------------|-------------|
| `CF_API_TOKEN` | Cloudflare API Token |

---

## Environment Variables

### Backend Secrets

프로덕션 환경에 다음 Secrets를 설정해야 합니다:

```bash
# Cloudflare Workers Secrets 설정
wrangler secret put YOUTH_CENTER_API_KEY --env production
# 값: [청년센터 API 키]

wrangler secret put KAKAO_CLIENT_ID --env production
# 값: [카카오 REST API 키]

wrangler secret put KAKAO_CLIENT_SECRET --env production
# 값: [카카오 Client Secret]

wrangler secret put HEALTH_CHECK_WEBHOOK_URL --env production
# 값: [Discord/Slack Webhook URL] (optional)
```

### Backend Environment Variables

`backend/wrangler.toml`의 `[env.production.vars]`에 정의:
- `ENVIRONMENT`: "production"
- `HEALTH_CHECK_FAILURE_THRESHOLD`: 5

### Frontend Environment Variables

빌드 시 자동 설정:
- `NODE_ENV`: "production"

---

## Database Setup

### 1. 프로덕션 D1 Database 생성

```bash
# D1 Database 생성
wrangler d1 create policy-flow-db-prod

# 출력에서 database_id 복사:
# ✅ Successfully created DB 'policy-flow-db-prod'
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. wrangler.toml 업데이트

`backend/wrangler.toml`의 프로덕션 설정을 업데이트:

```toml
[[env.production.d1_databases]]
binding = "DB"
database_name = "policy-flow-db-prod"
database_id = "YOUR_PRODUCTION_DATABASE_ID"  # 위에서 복사한 ID로 교체
```

### 3. 프로덕션 마이그레이션 실행

```bash
# 루트 디렉토리에서 실행
npm run migrate:prod

# 또는 backend 디렉토리에서 직접 실행
cd backend
npm run db:migrate:prod
```

---

## Deployment

### Method 1: GitHub Actions (권장)

1. `main` 브랜치에 Push:
```bash
git push origin main
```

2. GitHub Actions가 자동으로:
   - Backend 테스트 실행
   - Backend를 Cloudflare Workers에 배포
   - Frontend 빌드 및 Cloudflare Pages에 배포

3. 배포 상태 확인:
   - GitHub Repository > Actions 탭

### Method 2: Manual Deployment

#### Backend 배포
```bash
# 루트 디렉토리에서
npm run deploy:backend

# 또는 backend 디렉토리에서
cd backend
npm run deploy
```

#### Frontend 배포
```bash
# 루트 디렉토리에서
npm run deploy:frontend

# 또는 수동으로
cd frontend
npm run build
wrangler pages deploy out --project-name=policy-flow
```

---

## Cloudflare Pages 초기 설정

### 1. Pages 프로젝트 생성

```bash
wrangler pages project create policy-flow
```

### 2. Custom Domain 설정 (Optional)

Cloudflare Dashboard에서:
1. Pages > policy-flow > Custom Domains
2. 도메인 추가 및 DNS 설정

---

## Verification

### 1. Backend Health Check

```bash
curl https://policy-flow-backend.YOUR_SUBDOMAIN.workers.dev/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-18T...",
  "database": "connected"
}
```

### 2. Frontend Access

브라우저에서 접속:
- **Cloudflare Pages URL**: `https://policy-flow.pages.dev`
- **Custom Domain**: `https://yourdomain.com` (설정한 경우)

---

## Monitoring

### 1. Cloudflare Dashboard

- **Workers**: Workers & Pages > Overview
  - Request 수, Error Rate, CPU Time
- **D1**: D1 > policy-flow-db-prod
  - Query 수, Storage 사용량
- **Pages**: Pages > policy-flow
  - Deployment History, Analytics

### 2. Health Check Notifications

`HEALTH_CHECK_WEBHOOK_URL` 설정 시:
- Health Check 실패 시 Discord/Slack으로 알림 전송
- 실패 임계값: 5회 연속 실패

---

## Rollback

### Backend Rollback

```bash
# Cloudflare Dashboard에서:
# Workers & Pages > policy-flow-backend > Deployments
# 이전 버전 선택 > "Rollback to this deployment"
```

### Frontend Rollback

```bash
# Cloudflare Dashboard에서:
# Pages > policy-flow > Deployments
# 이전 버전 선택 > "Rollback to this deployment"
```

---

## Troubleshooting

### Database Connection Error

```bash
# D1 Database 바인딩 확인
wrangler d1 info policy-flow-db-prod --env production

# 마이그레이션 상태 확인
wrangler d1 migrations list policy-flow-db-prod --env production
```

### Secret Not Found Error

```bash
# Secrets 목록 확인
wrangler secret list --env production

# Secret 재설정
wrangler secret put SECRET_NAME --env production
```

### Build Failure

```bash
# 로컬에서 빌드 테스트
npm ci
npm run build

# 의존성 정리 후 재시도
npm run clean
npm ci
npm run build
```

---

## Cost Estimation

Cloudflare 무료 플랜 기준:

| Service | Free Tier | Expected Usage |
|---------|-----------|----------------|
| Workers | 100,000 requests/day | ~1,000 requests/day |
| D1 | 5GB storage, 5M rows read/day | ~10MB, ~10K rows/day |
| Pages | Unlimited requests | ~500 requests/day |

**예상 비용**: $0/월 (무료 플랜 범위 내)

---

## Security Checklist

- [ ] API Tokens는 GitHub Secrets에만 저장
- [ ] Secrets는 wrangler secret으로만 설정
- [ ] wrangler.toml에 민감한 정보 없음 (database_id는 공개 가능)
- [ ] CORS 설정 확인 (프로덕션 도메인만 허용)
- [ ] Rate Limiting 활성화 (Cloudflare Dashboard)

---

## Support

문제 발생 시:
1. [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
2. [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
3. [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
