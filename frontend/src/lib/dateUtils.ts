/**
 * 캘린더 날짜 계산 유틸리티
 */

/**
 * 해당 월의 캘린더 그리드를 위한 날짜 배열 생성 (6주 = 42일)
 */
export function getCalendarDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 첫 주의 이전 달 날짜들
  const firstDayOfWeek = firstDay.getDay(); // 0 (일요일) ~ 6 (토요일)
  for (let i = 0; i < firstDayOfWeek; i++) {
    const dayOffset = firstDayOfWeek - i;
    const date = new Date(year, month, 1 - dayOffset);
    days.push(date);
  }

  // 현재 달의 모든 날짜
  for (let date = 1; date <= lastDay.getDate(); date++) {
    days.push(new Date(year, month, date));
  }

  // 마지막 주의 다음 달 날짜들 (총 42일이 되도록)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

/**
 * 두 날짜가 같은 날인지 확인
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 날짜가 현재 월에 속하는지 확인
 */
export function isCurrentMonth(date: Date, currentMonth: number): boolean {
  return date.getMonth() === currentMonth;
}

/**
 * 날짜가 오늘인지 확인
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Unix timestamp를 Date 객체로 변환
 */
export function fromUnixTimestamp(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

/**
 * Date 객체를 Unix timestamp로 변환
 */
export function toUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 년월을 'YYYY년 M월' 형식으로 포맷
 */
export function formatYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
}
