# Backend Tests

PolicyFlow 백엔드 테스트 스위트입니다.

## 구조

```
__tests__/
├── setup.ts              # 전역 테스트 설정
├── utils/
│   ├── test-helpers.ts   # 테스트 유틸리티 (요청 헬퍼, Mock 생성 등)
│   └── fixtures.ts       # Mock 데이터 & 픽스처
└── api/
    └── health.test.ts    # Health Check API 테스트
```

## 실행 방법

```bash
# 모든 테스트 실행
npm run test

# Watch 모드 (개발 시)
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage
```

## 테스트 작성 가이드

### 기본 구조

```typescript
import { describe, it, expect } from 'vitest';
import { testRequest } from '../utils/test-helpers';

describe('API Name', () => {
  describe('GET /endpoint', () => {
    it('should return expected result', async () => {
      const res = await testRequest('GET', '/endpoint');
      expect(res.status).toBe(200);
    });
  });
});
```

### Mock 데이터 사용

```typescript
import { mockUser, mockPolicy, createMock } from '../utils/fixtures';

// 기본 픽스처 사용
const user = mockUser;

// 커스텀 데이터 생성
const customUser = createMock.user({
  email: 'custom@example.com',
});
```

### Mock 환경 설정

```typescript
import { testRequest, createMockEnv } from '../utils/test-helpers';

const res = await testRequest('GET', '/endpoint', {
  env: {
    ...createMockEnv(),
    CUSTOM_VAR: 'value',
  },
});
```

## 커버리지 목표

- 유닛 테스트: 80% 이상
- 통합 테스트: 주요 API 엔드포인트 100%

## 참고

- [Vitest 문서](https://vitest.dev/)
- [Hono Testing 가이드](https://hono.dev/docs/guides/testing)
