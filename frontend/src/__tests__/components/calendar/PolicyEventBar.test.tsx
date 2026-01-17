import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PolicyEventBar } from '@/src/components/calendar/PolicyEventBar';
import type { PolicyListItem } from '@policy-flow/contracts';

describe('PolicyEventBar', () => {
  const mockPolicy: PolicyListItem = {
    id: 'policy-1',
    title: '청년 월세 지원',
    summary: '서울시 청년 월세 지원 프로그램',
    category: 'HOUSING',
    region: 'SEOUL',
    status: 'OPEN',
    startDate: Math.floor(Date.now() / 1000),
    endDate: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    isAlwaysOpen: false,
  };

  it('정책 제목을 렌더링한다', () => {
    render(<PolicyEventBar policy={mockPolicy} onClick={() => {}} />);
    expect(screen.getByText('청년 월세 지원')).toBeInTheDocument();
  });

  it('상태별 색상을 적용한다 - OPEN', () => {
    const { container } = render(
      <PolicyEventBar policy={{ ...mockPolicy, status: 'OPEN' }} onClick={() => {}} />
    );
    const bar = container.querySelector('[data-testid="policy-event-bar"]');
    expect(bar).toHaveClass('bg-blue-500');
  });

  it('상태별 색상을 적용한다 - CLOSING_SOON', () => {
    const { container } = render(
      <PolicyEventBar policy={{ ...mockPolicy, status: 'CLOSING_SOON' }} onClick={() => {}} />
    );
    const bar = container.querySelector('[data-testid="policy-event-bar"]');
    expect(bar).toHaveClass('bg-red-500');
  });

  it('상태별 색상을 적용한다 - UPCOMING', () => {
    const { container } = render(
      <PolicyEventBar policy={{ ...mockPolicy, status: 'UPCOMING' }} onClick={() => {}} />
    );
    const bar = container.querySelector('[data-testid="policy-event-bar"]');
    expect(bar).toHaveClass('bg-gray-400');
  });

  it('상태별 색상을 적용한다 - CLOSED', () => {
    const { container } = render(
      <PolicyEventBar policy={{ ...mockPolicy, status: 'CLOSED' }} onClick={() => {}} />
    );
    const bar = container.querySelector('[data-testid="policy-event-bar"]');
    expect(bar).toHaveClass('bg-gray-300');
  });

  it('클릭 시 onClick 콜백을 호출한다', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<PolicyEventBar policy={mockPolicy} onClick={onClick} />);

    const bar = screen.getByTestId('policy-event-bar');
    await user.click(bar);

    expect(onClick).toHaveBeenCalledWith(mockPolicy);
  });

  it('키보드 접근성을 지원한다', () => {
    render(<PolicyEventBar policy={mockPolicy} onClick={() => {}} />);
    const bar = screen.getByTestId('policy-event-bar');
    expect(bar).toHaveAttribute('role', 'button');
    expect(bar).toHaveAttribute('tabIndex', '0');
  });
});
