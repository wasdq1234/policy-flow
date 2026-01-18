/**
 * 청년센터 API 날짜 파싱 유틸리티
 * 비정형 날짜 텍스트를 Unix timestamp로 변환
 */

/**
 * 단일 날짜 문자열을 Unix timestamp로 변환
 * @param dateStr - 날짜 문자열 (예: "2024.01.15", "2024년 1월 15일", "2024/01/15")
 * @returns Unix timestamp (초 단위) 또는 null
 */
export function parseDate(dateStr: string): number | null {
  if (!dateStr || dateStr.trim() === '') {
    return null;
  }

  // 상시모집 키워드는 null 반환
  const alwaysOpenKeywords = ['상시', '수시', '연중', '매월', '매년'];
  if (alwaysOpenKeywords.some(keyword => dateStr.includes(keyword))) {
    return null;
  }

  // 날짜 정규식 패턴들
  const patterns = [
    // YYYY.MM.DD
    /(\d{4})\.(\d{1,2})\.(\d{1,2})/,
    // YYYY-MM-DD
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
    // YYYY/MM/DD
    /(\d{4})\/(\d{1,2})\/(\d{1,2})/,
    // YYYY년 MM월 DD일
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
    // YYYY년 MM월 (일 없음)
    /(\d{4})년\s*(\d{1,2})월/,
    // YYYY.MM (일 없음)
    /(\d{4})\.(\d{1,2})(?!\.)/,
  ];

  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const day = match[3] ? parseInt(match[3], 10) : 1; // 일이 없으면 1일로 설정

      // 유효한 날짜인지 확인
      const date = new Date(Date.UTC(year, month - 1, day));
      if (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
      ) {
        return Math.floor(date.getTime() / 1000);
      }
    }
  }

  return null;
}

/**
 * 날짜 범위 파싱 결과
 */
export interface DateRange {
  startDate: number | null;
  endDate: number | null;
  isAlwaysOpen: boolean;
}

/**
 * 날짜 범위 문자열을 파싱
 * @param rangeStr - 날짜 범위 문자열 (예: "2024.01.01~2024.12.31", "상시모집")
 * @returns DateRange 객체
 */
export function parseDateRange(rangeStr: string): DateRange {
  if (!rangeStr || rangeStr.trim() === '') {
    return {
      startDate: null,
      endDate: null,
      isAlwaysOpen: false,
    };
  }

  // 상시모집 키워드 체크
  const alwaysOpenKeywords = ['상시모집', '연중상시', '수시접수', '매월 접수', '매년'];
  const isAlwaysOpen = alwaysOpenKeywords.some(keyword => rangeStr.includes(keyword));

  if (isAlwaysOpen) {
    return {
      startDate: null,
      endDate: null,
      isAlwaysOpen: true,
    };
  }

  // 범위 구분자 (~, -, ∼ 등)
  const rangeSeparators = ['~', '-', '∼', '–', '—'];
  let separator: string | null = null;

  for (const sep of rangeSeparators) {
    if (rangeStr.includes(sep)) {
      separator = sep;
      break;
    }
  }

  // 범위가 있는 경우
  if (separator) {
    const parts = rangeStr.split(separator).map(s => s.trim());

    // 시작일과 종료일 파싱
    const startDate = parts[0] ? parseDate(parts[0]) : null;
    const endDate = parts[1] ? parseDate(parts[1]) : null;

    return {
      startDate,
      endDate,
      isAlwaysOpen: false,
    };
  }

  // 범위 구분자가 없는 경우 (단일 날짜)
  const singleDate = parseDate(rangeStr);

  return {
    startDate: singleDate,
    endDate: singleDate,
    isAlwaysOpen: false,
  };
}
