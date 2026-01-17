# FilterPanel 통합 가이드

## 개요
FilterPanel을 CalendarView에 통합하여 정책 필터링 기능을 제공합니다.

## 구현된 컴포넌트

### 1. `filterStore.ts`
Zustand 기반 필터 상태 관리
```typescript
interface FilterState {
  region: Region | null;
  category: PolicyCategory | null;
  status: PolicyStatus | null;
  setRegion: (region: Region | null) => void;
  setCategory: (category: PolicyCategory | null) => void;
  setStatus: (status: PolicyStatus | null) => void;
  resetFilters: () => void;
}
```

### 2. `FilterPanel.tsx`
메인 필터 패널 컴포넌트
- 지역, 분야, 상태 필터를 포함
- 필터 초기화 버튼 제공

### 3. 서브 컴포넌트
- `RegionFilter.tsx` - 18개 지역 필터
- `CategoryFilter.tsx` - 6개 분야 필터 (취업, 주거, 대출, 교육, 창업, 복지)
- `StatusFilter.tsx` - 4개 상태 필터 (접수중, 마감임박, 오픈예정, 마감)

## CalendarView 통합 예시

```tsx
import { CalendarView } from './CalendarView';
import FilterPanel from './filter/FilterPanel';
import { useFilterStore } from '../stores/filterStore';
import { usePolicies } from '../hooks/usePolicies';

export function CalendarPage() {
  const { region, category, status } = useFilterStore();

  return (
    <div className="container mx-auto p-4">
      {/* 필터 패널 */}
      <div className="mb-4">
        <FilterPanel />
      </div>

      {/* 캘린더 뷰 */}
      <CalendarView onPolicyClick={(policy) => {
        // 정책 상세 보기 로직
        console.log('Policy clicked:', policy);
      }} />
    </div>
  );
}
```

## CalendarView 수정 예시

기존 `CalendarView.tsx`의 22번째 줄을 다음과 같이 수정:

```tsx
// Before
const { policies, isLoading, error } = usePolicies({ limit: 100 });

// After
import { useFilterStore } from '@/src/stores/filterStore';

export function CalendarView({ onPolicyClick }: CalendarViewProps) {
  // ... existing code ...
  const { region, category, status } = useFilterStore();

  const { policies, isLoading, error } = usePolicies({
    limit: 100,
    region,
    category,
    status
  });

  // ... rest of the code ...
}
```

## UI/UX 특징

### 칩 디자인
- **선택됨**: `bg-blue-500 text-white`
- **선택 안 됨**: `bg-gray-100 text-gray-700 hover:bg-gray-200`
- Rounded-full 스타일 (터치 친화적)

### 토글 동작
- 같은 필터를 다시 클릭하면 선택 해제
- 다른 필터를 클릭하면 기존 선택 해제 후 새 필터 선택

### 초기화
- "초기화" 버튼으로 모든 필터 한 번에 리셋

## 테스트 결과

✅ 모든 테스트 통과 (9/9)
- 렌더링 테스트
- 필터 선택 테스트
- 복수 필터 적용 테스트
- 필터 초기화 테스트
- 선택 해제 테스트
- 시각적 스타일 테스트

## 파일 목록

```
frontend/
├── src/
│   ├── stores/
│   │   └── filterStore.ts          # 필터 상태 관리
│   └── components/
│       └── filter/
│           ├── FilterPanel.tsx      # 메인 패널
│           ├── RegionFilter.tsx     # 지역 필터
│           ├── CategoryFilter.tsx   # 분야 필터
│           └── StatusFilter.tsx     # 상태 필터
└── __tests__/
    └── components/
        └── filter/
            └── FilterPanel.test.tsx # 통합 테스트
```

## 다음 단계

1. CalendarView에 FilterPanel 추가
2. usePolicies 훅에 필터 파라미터 전달
3. UI/UX 테스트 및 피드백 수집
4. 필요시 디자인 조정
