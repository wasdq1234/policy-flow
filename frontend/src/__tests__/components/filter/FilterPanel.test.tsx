import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterPanel from '@/src/components/filter/FilterPanel';
import { useFilterStore } from '@/src/stores/filterStore';

describe('FilterPanel', () => {
  beforeEach(() => {
    useFilterStore.getState().resetFilters();
  });

  it('렌더링되어야 한다', () => {
    render(<FilterPanel />);
    expect(screen.getByText(/지역/i)).toBeInTheDocument();
    expect(screen.getByText(/분야/i)).toBeInTheDocument();
    expect(screen.getByText(/상태/i)).toBeInTheDocument();
  });

  it('필터 초기화 버튼이 있어야 한다', () => {
    render(<FilterPanel />);
    expect(screen.getByText(/초기화/i)).toBeInTheDocument();
  });

  it('지역 필터를 선택할 수 있어야 한다', async () => {
    const user = userEvent.setup();
    render(<FilterPanel />);

    const seoulButton = screen.getByRole('button', { name: /서울/i });
    await user.click(seoulButton);

    const { region } = useFilterStore.getState();
    expect(region).toBe('SEOUL');
  });

  it('카테고리 필터를 선택할 수 있어야 한다', async () => {
    const user = userEvent.setup();
    render(<FilterPanel />);

    const jobButton = screen.getByRole('button', { name: /취업/i });
    await user.click(jobButton);

    const { category } = useFilterStore.getState();
    expect(category).toBe('JOB');
  });

  it('상태 필터를 선택할 수 있어야 한다', async () => {
    const user = userEvent.setup();
    render(<FilterPanel />);

    const openButton = screen.getByRole('button', { name: /접수중/i });
    await user.click(openButton);

    const { status } = useFilterStore.getState();
    expect(status).toBe('OPEN');
  });

  it('복수 필터를 동시에 적용할 수 있어야 한다', async () => {
    const user = userEvent.setup();
    render(<FilterPanel />);

    await user.click(screen.getByRole('button', { name: /서울/i }));
    await user.click(screen.getByRole('button', { name: /취업/i }));
    await user.click(screen.getByRole('button', { name: /접수중/i }));

    const state = useFilterStore.getState();
    expect(state.region).toBe('SEOUL');
    expect(state.category).toBe('JOB');
    expect(state.status).toBe('OPEN');
  });

  it('필터 초기화가 동작해야 한다', async () => {
    const user = userEvent.setup();
    render(<FilterPanel />);

    // 필터 적용
    await user.click(screen.getByRole('button', { name: /서울/i }));
    await user.click(screen.getByRole('button', { name: /취업/i }));

    // 초기화
    await user.click(screen.getByRole('button', { name: /초기화/i }));

    const state = useFilterStore.getState();
    expect(state.region).toBeNull();
    expect(state.category).toBeNull();
    expect(state.status).toBeNull();
  });

  it('선택된 필터는 시각적으로 구분되어야 한다', async () => {
    const user = userEvent.setup();
    render(<FilterPanel />);

    const seoulButton = screen.getByRole('button', { name: /서울/i });
    await user.click(seoulButton);

    expect(seoulButton).toHaveClass('bg-blue-500');
    expect(seoulButton).toHaveClass('text-white');
  });

  it('같은 필터를 다시 클릭하면 선택 해제되어야 한다', async () => {
    const user = userEvent.setup();
    render(<FilterPanel />);

    const seoulButton = screen.getByRole('button', { name: /서울/i });

    // 선택
    await user.click(seoulButton);
    expect(useFilterStore.getState().region).toBe('SEOUL');

    // 선택 해제
    await user.click(seoulButton);
    expect(useFilterStore.getState().region).toBeNull();
  });
});
