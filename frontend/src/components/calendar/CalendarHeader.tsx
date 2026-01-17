import { formatYearMonth } from '@/src/lib/dateUtils';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-800">
        {formatYearMonth(currentDate)}
      </h2>
      <div className="flex gap-2">
        <button
          onClick={onPrevMonth}
          aria-label="이전 달"
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
        >
          &lt;
        </button>
        <button
          onClick={onToday}
          className="px-3 py-1 bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors"
        >
          오늘
        </button>
        <button
          onClick={onNextMonth}
          aria-label="다음 달"
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
