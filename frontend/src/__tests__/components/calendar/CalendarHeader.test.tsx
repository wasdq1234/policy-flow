import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarHeader } from '@/src/components/calendar/CalendarHeader';

describe('CalendarHeader', () => {
  it('현재 월을 렌더링한다', () => {
    const currentDate = new Date(2026, 0, 17); // 2026년 1월 17일
    render(
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={() => {}}
        onNextMonth={() => {}}
        onToday={() => {}}
      />
    );
    expect(screen.getByText('2026년 1월')).toBeInTheDocument();
  });

  it('이전 월 버튼 클릭 시 onPrevMonth를 호출한다', async () => {
    const user = userEvent.setup();
    const onPrevMonth = vi.fn();
    const currentDate = new Date(2026, 0, 17);

    render(
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={onPrevMonth}
        onNextMonth={() => {}}
        onToday={() => {}}
      />
    );

    const prevButton = screen.getByLabelText('이전 달');
    await user.click(prevButton);

    expect(onPrevMonth).toHaveBeenCalledTimes(1);
  });

  it('다음 월 버튼 클릭 시 onNextMonth를 호출한다', async () => {
    const user = userEvent.setup();
    const onNextMonth = vi.fn();
    const currentDate = new Date(2026, 0, 17);

    render(
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={() => {}}
        onNextMonth={onNextMonth}
        onToday={() => {}}
      />
    );

    const nextButton = screen.getByLabelText('다음 달');
    await user.click(nextButton);

    expect(onNextMonth).toHaveBeenCalledTimes(1);
  });

  it('오늘 버튼 클릭 시 onToday를 호출한다', async () => {
    const user = userEvent.setup();
    const onToday = vi.fn();
    const currentDate = new Date(2026, 0, 17);

    render(
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={() => {}}
        onNextMonth={() => {}}
        onToday={onToday}
      />
    );

    const todayButton = screen.getByText('오늘');
    await user.click(todayButton);

    expect(onToday).toHaveBeenCalledTimes(1);
  });
});
