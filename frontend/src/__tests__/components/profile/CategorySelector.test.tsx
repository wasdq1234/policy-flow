import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategorySelector } from '@/src/components/profile/CategorySelector';
import { POLICY_CATEGORIES } from '@policy-flow/contracts';

describe('CategorySelector', () => {
  it('renders all category options', () => {
    render(<CategorySelector value={[]} onChange={vi.fn()} />);

    expect(screen.getByText('취업·일자리')).toBeInTheDocument();
    expect(screen.getByText('주거·임대')).toBeInTheDocument();
    expect(screen.getByText('대출·자금')).toBeInTheDocument();
    expect(screen.getByText('교육·장학')).toBeInTheDocument();
    expect(screen.getByText('창업·사업')).toBeInTheDocument();
    expect(screen.getByText('복지·생활')).toBeInTheDocument();
  });

  it('highlights selected categories', () => {
    render(<CategorySelector value={['JOB', 'HOUSING']} onChange={vi.fn()} />);

    const job = screen.getByText('취업·일자리').closest('button');
    const housing = screen.getByText('주거·임대').closest('button');
    const loan = screen.getByText('대출·자금').closest('button');

    expect(job).toHaveClass('bg-blue-600');
    expect(housing).toHaveClass('bg-blue-600');
    expect(loan).not.toHaveClass('bg-blue-600');
  });

  it('adds category when unselected category is clicked', () => {
    const handleChange = vi.fn();
    render(<CategorySelector value={['JOB']} onChange={handleChange} />);

    fireEvent.click(screen.getByText('주거·임대'));
    expect(handleChange).toHaveBeenCalledWith(['JOB', 'HOUSING']);
  });

  it('removes category when selected category is clicked', () => {
    const handleChange = vi.fn();
    render(<CategorySelector value={['JOB', 'HOUSING']} onChange={handleChange} />);

    fireEvent.click(screen.getByText('주거·임대'));
    expect(handleChange).toHaveBeenCalledWith(['JOB']);
  });

  it('renders all 6 categories from constants', () => {
    render(<CategorySelector value={[]} onChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(POLICY_CATEGORIES.length);
  });
});
