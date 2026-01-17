import { useCalendarStore } from '@/src/stores/calendarStore';
import { usePolicies } from '@/src/hooks/usePolicies';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { ListView } from './ListView';
import type { PolicyListItem } from '@policy-flow/contracts';

interface CalendarViewProps {
  onPolicyClick: (policy: PolicyListItem) => void;
}

export function CalendarView({ onPolicyClick }: CalendarViewProps) {
  const {
    currentDate,
    viewType,
    setViewType,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
  } = useCalendarStore();

  const { policies, isLoading, error } = usePolicies({ limit: 100 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">에러가 발생했습니다: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* 헤더 + 뷰 토글 */}
      <div className="mb-6">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
        />

        {/* 뷰 타입 토글 버튼 */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setViewType('calendar')}
            className={`px-4 py-2 rounded transition-colors ${
              viewType === 'calendar'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            캘린더
          </button>
          <button
            onClick={() => setViewType('list')}
            className={`px-4 py-2 rounded transition-colors ${
              viewType === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            목록
          </button>
        </div>
      </div>

      {/* 캘린더 또는 리스트 뷰 */}
      {viewType === 'calendar' ? (
        <CalendarGrid
          currentDate={currentDate}
          policies={policies}
          onPolicyClick={onPolicyClick}
        />
      ) : (
        <ListView policies={policies} onPolicyClick={onPolicyClick} />
      )}
    </div>
  );
}
