import type { PolicyListItem } from '@policy-flow/contracts';
import { PolicyEventBar } from './PolicyEventBar';
import {
  getCalendarDays,
  isCurrentMonth,
  isToday,
  formatDate,
  fromUnixTimestamp,
} from '@/src/lib/dateUtils';

interface CalendarGridProps {
  currentDate: Date;
  policies: PolicyListItem[];
  onPolicyClick: (policy: PolicyListItem) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function CalendarGrid({
  currentDate,
  policies,
  onPolicyClick,
}: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarDays = getCalendarDays(year, month);

  // 각 날짜에 해당하는 정책 이벤트 필터링
  const getPoliciesForDate = (date: Date): PolicyListItem[] => {
    return policies.filter((policy) => {
      if (policy.isAlwaysOpen) return false;
      if (!policy.startDate || !policy.endDate) return false;

      const startDate = fromUnixTimestamp(policy.startDate);
      const endDate = fromUnixTimestamp(policy.endDate);

      // 날짜 비교 (시간 무시)
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const startOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      return dateOnly >= startOnly && dateOnly <= endOnly;
    });
  };

  return (
    <div className="w-full">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date) => {
          const dateStr = formatDate(date);
          const isCurrentMonthDate = isCurrentMonth(date, month);
          const isTodayDate = isToday(date);
          const policiesForDate = getPoliciesForDate(date);

          return (
            <div
              key={dateStr}
              data-testid={`calendar-cell-${dateStr}`}
              className={`
                min-h-[80px] p-2 border rounded
                ${isTodayDate ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-200'}
                ${isCurrentMonthDate ? 'text-gray-900' : 'text-gray-400'}
              `}
            >
              <div className="text-sm font-medium mb-1">{date.getDate()}</div>
              <div className="space-y-1">
                {policiesForDate.slice(0, 3).map((policy) => (
                  <PolicyEventBar
                    key={policy.id}
                    policy={policy}
                    onClick={onPolicyClick}
                  />
                ))}
                {policiesForDate.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{policiesForDate.length - 3}개
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
