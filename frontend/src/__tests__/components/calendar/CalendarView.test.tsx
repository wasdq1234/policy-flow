import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarView } from '@/src/components/calendar/CalendarView';
import { useCalendarStore } from '@/src/stores/calendarStore';

describe('CalendarView', () => {
  beforeEach(() => {
    // Reset store before each test
    useCalendarStore.setState({
      currentDate: new Date(2026, 0, 17),
      viewType: 'calendar',
    });
  });

  it('로딩 상태를 렌더링한다', () => {
    render(<CalendarView onPolicyClick={() => {}} />);
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('캘린더 뷰를 렌더링한다', async () => {
    render(<CalendarView onPolicyClick={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('2026년 1월')).toBeInTheDocument();
    });

    // 요일 헤더 확인
    expect(screen.getByText('일')).toBeInTheDocument();
    expect(screen.getByText('월')).toBeInTheDocument();
  });

  it('정책 데이터를 렌더링한다', async () => {
    render(<CalendarView onPolicyClick={() => {}} />);

    await waitFor(() => {
      // 정책이 여러 날짜에 표시될 수 있으므로 getAllByText 사용
      const policyElements = screen.getAllByText('청년 월세 지원');
      expect(policyElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('뷰 타입을 토글할 수 있다', async () => {
    const user = userEvent.setup();
    render(<CalendarView onPolicyClick={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('2026년 1월')).toBeInTheDocument();
    });

    // 리스트 뷰로 전환
    const listButton = screen.getByText('목록');
    await user.click(listButton);

    await waitFor(() => {
      // 리스트 뷰에서는 요일 헤더가 없어야 함
      expect(screen.queryByText('일')).not.toBeInTheDocument();
      // 정책 데이터는 있어야 함
      expect(screen.getByText('청년 월세 지원')).toBeInTheDocument();
    });

    // 캘린더 뷰로 다시 전환
    const calendarButton = screen.getByText('캘린더');
    await user.click(calendarButton);

    await waitFor(() => {
      expect(screen.getByText('일')).toBeInTheDocument();
    });
  });

  it('월 네비게이션이 동작한다', async () => {
    const user = userEvent.setup();
    render(<CalendarView onPolicyClick={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('2026년 1월')).toBeInTheDocument();
    });

    // 다음 월로 이동
    const nextButton = screen.getByLabelText('다음 달');
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('2026년 2월')).toBeInTheDocument();
    });

    // 이전 월로 이동
    const prevButton = screen.getByLabelText('이전 달');
    await user.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText('2026년 1월')).toBeInTheDocument();
    });
  });

  it('오늘 버튼이 동작한다', async () => {
    const user = userEvent.setup();

    // 다른 날짜로 설정
    useCalendarStore.setState({
      currentDate: new Date(2025, 11, 1),
    });

    render(<CalendarView onPolicyClick={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('2025년 12월')).toBeInTheDocument();
    });

    // 오늘로 이동
    const todayButton = screen.getByText('오늘');
    await user.click(todayButton);

    await waitFor(() => {
      const today = new Date();
      const expectedText = `${today.getFullYear()}년 ${today.getMonth() + 1}월`;
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });
  });

  it('정책 클릭 시 콜백을 호출한다', async () => {
    const user = userEvent.setup();
    const onPolicyClick = vi.fn();

    render(<CalendarView onPolicyClick={onPolicyClick} />);

    await waitFor(() => {
      const policyElements = screen.getAllByText('청년 월세 지원');
      expect(policyElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    // 여러 개 있을 수 있으므로 첫 번째 것 클릭
    const policyBars = screen.getAllByText('청년 월세 지원');
    await user.click(policyBars[0]);

    expect(onPolicyClick).toHaveBeenCalled();
    expect(onPolicyClick.mock.calls[0][0]).toHaveProperty('title', '청년 월세 지원');
  });

  it('에러 상태를 렌더링한다', async () => {
    // Mock fetch to throw error
    const originalFetch = global.fetch;
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    render(<CalendarView onPolicyClick={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/에러가 발생했습니다/)).toBeInTheDocument();
    });

    // Restore fetch
    global.fetch = originalFetch;
  });
});
