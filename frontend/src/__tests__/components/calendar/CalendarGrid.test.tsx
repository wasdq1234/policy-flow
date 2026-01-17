import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarGrid } from '@/src/components/calendar/CalendarGrid';
import type { PolicyListItem } from '@policy-flow/contracts';

describe('CalendarGrid', () => {
  const mockPolicies: PolicyListItem[] = [
    {
      id: 'policy-1',
      title: '청년 월세 지원',
      summary: '서울시 청년 월세 지원 프로그램',
      category: 'HOUSING',
      region: 'SEOUL',
      status: 'OPEN',
      startDate: Math.floor(new Date(2026, 0, 10).getTime() / 1000),
      endDate: Math.floor(new Date(2026, 0, 20).getTime() / 1000),
      isAlwaysOpen: false,
    },
    {
      id: 'policy-2',
      title: '청년 취업 장려금',
      summary: '경기도 청년 취업 장려금 지원',
      category: 'JOB',
      region: 'GYEONGGI',
      status: 'CLOSING_SOON',
      startDate: Math.floor(new Date(2026, 0, 15).getTime() / 1000),
      endDate: Math.floor(new Date(2026, 0, 18).getTime() / 1000),
      isAlwaysOpen: false,
    },
  ];

  it('요일 헤더를 렌더링한다', () => {
    const currentDate = new Date(2026, 0, 17);
    render(
      <CalendarGrid
        currentDate={currentDate}
        policies={[]}
        onPolicyClick={() => {}}
      />
    );

    expect(screen.getByText('일')).toBeInTheDocument();
    expect(screen.getByText('월')).toBeInTheDocument();
    expect(screen.getByText('화')).toBeInTheDocument();
    expect(screen.getByText('수')).toBeInTheDocument();
    expect(screen.getByText('목')).toBeInTheDocument();
    expect(screen.getByText('금')).toBeInTheDocument();
    expect(screen.getByText('토')).toBeInTheDocument();
  });

  it('42개의 날짜 셀을 렌더링한다 (6주)', () => {
    const currentDate = new Date(2026, 0, 17);
    const { container } = render(
      <CalendarGrid
        currentDate={currentDate}
        policies={[]}
        onPolicyClick={() => {}}
      />
    );

    const cells = container.querySelectorAll('[data-testid^="calendar-cell-"]');
    expect(cells).toHaveLength(42);
  });

  it('현재 월의 날짜를 강조한다', () => {
    const currentDate = new Date(2026, 0, 17);
    const { container } = render(
      <CalendarGrid
        currentDate={currentDate}
        policies={[]}
        onPolicyClick={() => {}}
      />
    );

    // 1월 1일 셀 (현재 월)
    const cell = container.querySelector('[data-testid="calendar-cell-2026-01-01"]');
    expect(cell).toHaveClass('text-gray-900');
  });

  it('다른 월의 날짜를 흐리게 표시한다', () => {
    const currentDate = new Date(2026, 0, 17);
    const { container } = render(
      <CalendarGrid
        currentDate={currentDate}
        policies={[]}
        onPolicyClick={() => {}}
      />
    );

    // 12월 날짜 셀 (이전 월)
    const cells = container.querySelectorAll('[data-testid^="calendar-cell-2025-12"]');
    if (cells.length > 0) {
      expect(cells[0]).toHaveClass('text-gray-400');
    }
  });

  it('오늘 날짜를 강조한다', () => {
    const today = new Date();
    const { container } = render(
      <CalendarGrid
        currentDate={today}
        policies={[]}
        onPolicyClick={() => {}}
      />
    );

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayCell = container.querySelector(
      `[data-testid="calendar-cell-${year}-${month}-${day}"]`
    );

    expect(todayCell).toHaveClass('bg-blue-100');
  });

  it('정책 이벤트 바를 렌더링한다', () => {
    const currentDate = new Date(2026, 0, 17);
    render(
      <CalendarGrid
        currentDate={currentDate}
        policies={mockPolicies}
        onPolicyClick={() => {}}
      />
    );

    // 정책이 여러 날짜에 표시될 수 있으므로 getAllByText 사용
    const policy1Elements = screen.getAllByText('청년 월세 지원');
    expect(policy1Elements.length).toBeGreaterThan(0);

    const policy2Elements = screen.getAllByText('청년 취업 장려금');
    expect(policy2Elements.length).toBeGreaterThan(0);
  });

  it('정책 클릭 시 onPolicyClick을 호출한다', async () => {
    const user = userEvent.setup();
    const onPolicyClick = vi.fn();
    const currentDate = new Date(2026, 0, 17);

    render(
      <CalendarGrid
        currentDate={currentDate}
        policies={mockPolicies}
        onPolicyClick={onPolicyClick}
      />
    );

    // 여러 개 있을 수 있으므로 첫 번째 것 클릭
    const policyBars = screen.getAllByText('청년 월세 지원');
    await user.click(policyBars[0]);

    expect(onPolicyClick).toHaveBeenCalledWith(mockPolicies[0]);
  });
});
