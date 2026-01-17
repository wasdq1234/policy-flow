# Design System (기초 디자인 시스템): PolicyFlow KR

> 정책 정보를 명확하고 신뢰감 있게 전달하는 디자인 언어

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

## 1. 디자인 철학

### 1.1 핵심 가치

| 가치 | 설명 | 구현 방법 |
|------|------|----------|
| **명확함** | 정책 정보는 복잡하므로, 핵심만 전달 | 여백 활용, 정보 계층 명확히 |
| **신뢰감** | 공공 정보를 다루므로 진지하고 공식적인 톤 | 차분한 블루 계열, 깔끔한 레이아웃 |
| **접근성** | 20대부터 50대까지 다양한 연령층 | 큰 터치 영역, 읽기 쉬운 폰트 |

### 1.2 참고 서비스 (무드보드)

| 서비스 | 참고할 점 | 참고하지 않을 점 |
|--------|----------|-----------------|
| 정부24 | 공식적인 톤, 신뢰감 | 복잡한 네비게이션 |
| 토스 | 깔끔한 카드 UI, 여백 | 과도한 애니메이션 |
| 구글 캘린더 | 직관적인 캘린더 UX | 단조로운 색상 |
| 네이버 카페 | 게시판 구조, 댓글 UX | 광고 과다 |

---

## 2. 컬러 팔레트

### 2.1 역할 기반 컬러

| 역할 | 컬러명 | Hex | 사용처 |
|------|--------|-----|--------|
| **Primary** | Policy Blue | `#2563EB` | 주요 버튼, 링크, 강조 |
| **Primary Light** | Light Blue | `#DBEAFE` | 호버 배경, 선택 상태 |
| **Primary Dark** | Deep Blue | `#1D4ED8` | 버튼 호버, 액티브 |
| **Secondary** | Slate | `#64748B` | 보조 버튼, 비활성 텍스트 |
| **Surface** | White | `#FFFFFF` | 카드, 모달 배경 |
| **Background** | Gray 50 | `#F8FAFC` | 전체 페이지 배경 |
| **Text Primary** | Gray 900 | `#0F172A` | 주요 텍스트 |
| **Text Secondary** | Gray 500 | `#64748B` | 보조 텍스트, 캡션 |
| **Border** | Gray 200 | `#E2E8F0` | 카드 테두리, 구분선 |

### 2.2 피드백 컬러

| 상태 | 컬러 | Hex | 배경 | 사용처 |
|------|------|-----|------|--------|
| **Success** | 초록 | `#16A34A` | `#DCFCE7` | 성공 메시지, 완료 |
| **Warning** | 노랑 | `#CA8A04` | `#FEF9C3` | 주의, 마감 임박 |
| **Error** | 빨강 | `#DC2626` | `#FEE2E2` | 오류, 삭제 |
| **Info** | 파랑 | `#2563EB` | `#DBEAFE` | 정보, 도움말 |

### 2.3 정책 상태 컬러

| 상태 | 컬러 | Hex | 의미 |
|------|------|-----|------|
| **접수 중** | 초록 | `#16A34A` | 현재 신청 가능 |
| **마감 임박** | 빨강 | `#DC2626` | 3일 이내 마감 |
| **오픈 예정** | 노랑 | `#CA8A04` | 곧 시작 예정 |
| **상시** | 보라 | `#7C3AED` | 예산 소진 시까지 |
| **마감** | 회색 | `#94A3B8` | 접수 종료 |

### 2.4 게시글 유형 컬러

| 유형 | 컬러 | Hex | 배경 |
|------|------|-----|------|
| 꿀팁 | 초록 | `#16A34A` | `#DCFCE7` |
| 질문 | 파랑 | `#2563EB` | `#DBEAFE` |
| 후기 | 주황 | `#EA580C` | `#FFEDD5` |
| 일반 | 회색 | `#64748B` | `#F1F5F9` |

### 2.5 다크 모드 (v2)

- MVP에서는 라이트 모드만 지원
- 다크 모드는 v2에서 CSS 변수 기반으로 추가 예정

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

| 용도 | 폰트 | 대안 |
|------|------|------|
| 본문 | Pretendard | system-ui, -apple-system, sans-serif |
| 숫자/날짜 | Pretendard (고정폭 숫자) | tabular-nums |

**CDN 로드:**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
```

### 3.2 타입 스케일

| 이름 | 크기 | 굵기 | 행간 | 용도 |
|------|------|------|------|------|
| Display | 32px | Bold (700) | 1.2 | 히어로 제목 |
| H1 | 24px | Bold (700) | 1.3 | 페이지 제목 |
| H2 | 20px | SemiBold (600) | 1.4 | 섹션 제목 |
| H3 | 18px | SemiBold (600) | 1.4 | 카드 제목 |
| Body Large | 16px | Regular (400) | 1.6 | 강조 본문 |
| Body | 14px | Regular (400) | 1.6 | 기본 본문 |
| Caption | 12px | Regular (400) | 1.5 | 부가 정보, 날짜 |
| Small | 11px | Medium (500) | 1.4 | 태그, 배지 |

### 3.3 TailwindCSS 설정

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    fontFamily: {
      sans: ['Pretendard', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      'display': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
      'h1': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
      'h2': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
      'h3': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
      'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
      'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
      'caption': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      'small': ['11px', { lineHeight: '1.4', fontWeight: '500' }],
    },
  },
}
```

---

## 4. 간격 토큰 (Spacing)

| 이름 | 값 | Tailwind | 용도 |
|------|-----|----------|------|
| xs | 4px | `p-1` | 아이콘-텍스트 간격 |
| sm | 8px | `p-2` | 인라인 요소 간격 |
| md | 16px | `p-4` | 카드 내부 여백 |
| lg | 24px | `p-6` | 섹션 간 간격 |
| xl | 32px | `p-8` | 큰 섹션 구분 |
| 2xl | 48px | `p-12` | 페이지 상하 여백 |

---

## 5. 기본 컴포넌트

### 5.1 버튼 (Button)

| 상태 | Primary | Secondary | Ghost |
|------|---------|-----------|-------|
| 기본 | `bg-blue-600 text-white` | `border border-gray-300 text-gray-700` | `text-blue-600` |
| 호버 | `bg-blue-700` | `bg-gray-50` | `underline` |
| 포커스 | `ring-2 ring-blue-500 ring-offset-2` | 동일 | 동일 |
| 비활성 | `opacity-50 cursor-not-allowed` | 동일 | 동일 |
| 로딩 | 스피너 + `opacity-75` | 동일 | 동일 |

**크기:**
| 사이즈 | 높이 | 패딩 | 폰트 |
|--------|------|------|------|
| Large | 48px | `px-6` | 16px |
| Medium | 40px | `px-4` | 14px (기본) |
| Small | 32px | `px-3` | 12px |

**컴포넌트 예시:**
```tsx
<Button variant="primary" size="md" loading={false}>
  신청하기
</Button>
```

### 5.2 입력 필드 (Input)

| 상태 | 스타일 |
|------|--------|
| 기본 | `border border-gray-300 rounded-lg px-4 py-3` |
| 포커스 | `border-blue-500 ring-2 ring-blue-200` |
| 에러 | `border-red-500 ring-2 ring-red-200` |
| 비활성 | `bg-gray-100 text-gray-400` |

**구조:**
```
┌─────────────────────────────────┐
│ 라벨 (선택)                      │
├─────────────────────────────────┤
│ [입력 필드]                      │
├─────────────────────────────────┤
│ 에러 메시지 (조건부)              │
└─────────────────────────────────┘
```

### 5.3 카드 (Card)

| 속성 | 값 |
|------|-----|
| 배경 | `bg-white` |
| 테두리 | `border border-gray-200` |
| 모서리 | `rounded-xl` (12px) |
| 그림자 | `shadow-sm` (0 1px 2px rgba(0,0,0,0.05)) |
| 내부 여백 | `p-4` (16px) |
| 호버 | `hover:shadow-md transition-shadow` |

### 5.4 정책 이벤트 바 (캘린더)

```
┌──────────────────────────────────────┐
│ ● 청년 월세 지원               D-3 │
└──────────────────────────────────────┘
```

| 요소 | 스타일 |
|------|--------|
| 컨테이너 | `rounded-md px-2 py-1 text-sm` |
| 상태 점 | `w-2 h-2 rounded-full` |
| D-Day 배지 | `bg-red-100 text-red-700 px-1.5 rounded` |

**상태별 배경:**
| 상태 | 배경색 | 텍스트색 |
|------|--------|---------|
| 접수 중 | `bg-green-100` | `text-green-800` |
| 마감 임박 | `bg-red-100` | `text-red-800` |
| 오픈 예정 | `bg-yellow-100` | `text-yellow-800` |

### 5.5 게시글 카드

```
┌─────────────────────────────────────────┐
│ [꿀팁] 청년 월세 지원 신청 후기          │
│                                         │
│ 서류 준비할 때 꿀팁 공유합니다...        │
│                                         │
│ 익명#A3F2 · 3시간 전 · 조회 123 · 💬 5  │
└─────────────────────────────────────────┘
```

### 5.6 태그/배지 (Tag)

| 유형 | 스타일 |
|------|--------|
| 꿀팁 | `bg-green-100 text-green-700` |
| 질문 | `bg-blue-100 text-blue-700` |
| 후기 | `bg-orange-100 text-orange-700` |
| 일반 | `bg-gray-100 text-gray-700` |

**공통:**
```css
px-2 py-0.5 rounded-full text-small font-medium
```

### 5.7 모달 (Modal)

| 속성 | 값 |
|------|-----|
| 오버레이 | `bg-black/50 backdrop-blur-sm` |
| 컨테이너 | `bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4` |
| 헤더 | `px-6 py-4 border-b` |
| 본문 | `px-6 py-4` |
| 푸터 | `px-6 py-4 border-t flex gap-3 justify-end` |

### 5.8 하단 탭 네비게이션

```
┌─────────────────────────────────────────┐
│  📅 캘린더  │  💬 게시판  │  👤 마이   │
└─────────────────────────────────────────┘
```

| 상태 | 스타일 |
|------|--------|
| 기본 | `text-gray-400` |
| 활성 | `text-blue-600` |
| 아이콘 | 24px |
| 라벨 | 11px |

---

## 6. 접근성 체크리스트

### 6.1 필수 (MVP)

- [x] **색상 대비**: 텍스트와 배경 4.5:1 이상 (WCAG AA)
- [x] **포커스 링**: `ring-2 ring-offset-2` 명확하게 표시
- [x] **클릭 영역**: 터치 대상 최소 44x44px
- [x] **에러 표시**: 색상 + 아이콘 + 텍스트 병행
- [x] **폰트 크기**: 본문 최소 14px

### 6.2 권장 (v2)

- [ ] 키보드 전체 탐색 가능 (Tab, Enter, Esc)
- [ ] 스크린 리더 호환 (ARIA 라벨)
- [ ] `prefers-reduced-motion` 대응
- [ ] 고대비 모드

### 6.3 색상 대비 검증

| 조합 | 대비율 | 통과 |
|------|--------|------|
| Gray 900 on White | 15.5:1 | ✅ |
| Blue 600 on White | 4.7:1 | ✅ |
| Gray 500 on White | 4.6:1 | ✅ |
| White on Blue 600 | 4.7:1 | ✅ |

---

## 7. 아이콘 & 일러스트

### 7.1 아이콘 라이브러리

| 선택 | 설명 | 링크 |
|------|------|------|
| **Lucide** (채택) | 깔끔한 라인 아이콘, 트리쉐이킹 지원 | lucide.dev |

### 7.2 주요 아이콘 목록

| 아이콘 | Lucide 이름 | 사용처 |
|--------|------------|--------|
| 캘린더 | `Calendar` | 탭 네비게이션 |
| 게시판 | `MessageSquare` | 탭 네비게이션 |
| 마이페이지 | `User` | 탭 네비게이션 |
| 북마크 | `Bookmark` / `BookmarkCheck` | 북마크 토글 |
| 필터 | `SlidersHorizontal` | 필터 버튼 |
| 검색 | `Search` | 검색창 |
| 알림 | `Bell` | 알림 아이콘 |
| 좋아요 | `ThumbsUp` | 게시글/댓글 |
| 댓글 | `MessageCircle` | 댓글 카운트 |
| 조회 | `Eye` | 조회수 |
| 링크 | `ExternalLink` | 외부 링크 |
| 닫기 | `X` | 모달 닫기 |
| 뒤로 | `ChevronLeft` | 뒤로가기 |
| 더보기 | `MoreVertical` | 드롭다운 |

### 7.3 아이콘 사용 규칙

- **크기**: 16px (작음), 20px (기본), 24px (큼)
- **색상**: 텍스트와 동일하게 `currentColor` 상속
- **버튼 내**: 텍스트 왼쪽, 간격 8px (`gap-2`)
- **스트로크**: 2px (기본)

---

## 8. 반응형 브레이크포인트

| 브레이크포인트 | 값 | 용도 |
|---------------|-----|------|
| sm | 640px | 소형 모바일 → 대형 모바일 |
| md | 768px | 모바일 → 태블릿 |
| lg | 1024px | 태블릿 → 데스크톱 |
| xl | 1280px | 데스크톱 → 와이드 |

### 8.1 캘린더 뷰 반응형

| 화면 | 기본 뷰 | 대체 |
|------|--------|------|
| 모바일 (< md) | 리스트 뷰 | 월간 달력 토글 |
| 태블릿 이상 | 월간 달력 | 리스트 뷰 토글 |

---

## 9. 애니메이션 & 트랜지션

### 9.1 기본 트랜지션

| 용도 | 속성 | 시간 |
|------|------|------|
| 호버 | `transition-colors` | 150ms |
| 모달 | `transition-opacity` | 200ms |
| 드롭다운 | `transition-transform` | 150ms |

### 9.2 Ease 함수

```css
--ease-out: cubic-bezier(0.33, 1, 0.68, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

### 9.3 모션 감소 대응 (v2)

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
```

---

## Decision Log

| # | 결정 | 이유 |
|---|------|------|
| 1 | Pretendard 폰트 | 한글 최적화, 무료, 가변 폰트 |
| 2 | 블루 계열 Primary | 신뢰감, 공공 서비스 느낌 |
| 3 | 라이트 모드 only (MVP) | 복잡도 감소, 다크모드는 v2 |
| 4 | Lucide 아이콘 | 경량, 트리쉐이킹, 일관된 스타일 |
| 5 | TailwindCSS | 빠른 개발, 번들 최적화, 디자인 토큰 관리 |
