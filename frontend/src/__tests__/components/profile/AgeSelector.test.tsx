import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgeSelector } from '@/src/components/profile/AgeSelector';
import { AGE_GROUPS } from '@policy-flow/contracts';

describe('AgeSelector', () => {
  it('renders all age group options', () => {
    render(<AgeSelector value={null} onChange={vi.fn()} />);

    expect(screen.getByText('10대')).toBeInTheDocument();
    expect(screen.getByText('20대')).toBeInTheDocument();
    expect(screen.getByText('30대')).toBeInTheDocument();
    expect(screen.getByText('40대')).toBeInTheDocument();
    expect(screen.getByText('50대')).toBeInTheDocument();
    expect(screen.getByText('60대 이상')).toBeInTheDocument();
  });

  it('highlights selected age group', () => {
    render(<AgeSelector value="20s" onChange={vi.fn()} />);

    const selected = screen.getByText('20대').closest('button');
    expect(selected).toHaveClass('bg-blue-600');
  });

  it('calls onChange when age group is clicked', () => {
    const handleChange = vi.fn();
    render(<AgeSelector value={null} onChange={handleChange} />);

    fireEvent.click(screen.getByText('30대'));
    expect(handleChange).toHaveBeenCalledWith('30s');
  });

  it('renders all 6 age groups from constants', () => {
    render(<AgeSelector value={null} onChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(AGE_GROUPS.length);
  });
});
