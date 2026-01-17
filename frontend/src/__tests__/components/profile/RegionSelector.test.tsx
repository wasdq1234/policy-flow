import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RegionSelector } from '@/src/components/profile/RegionSelector';
import { REGIONS } from '@policy-flow/contracts';

describe('RegionSelector', () => {
  it('renders all region options', () => {
    render(<RegionSelector value={null} onChange={vi.fn()} />);

    expect(screen.getByText('전체')).toBeInTheDocument();
    expect(screen.getByText('서울')).toBeInTheDocument();
    expect(screen.getByText('부산')).toBeInTheDocument();
    expect(screen.getByText('경기')).toBeInTheDocument();
  });

  it('highlights selected region', () => {
    render(<RegionSelector value="SEOUL" onChange={vi.fn()} />);

    const selected = screen.getByText('서울').closest('button');
    expect(selected).toHaveClass('bg-blue-600');
  });

  it('calls onChange when region is clicked', () => {
    const handleChange = vi.fn();
    render(<RegionSelector value={null} onChange={handleChange} />);

    fireEvent.click(screen.getByText('부산'));
    expect(handleChange).toHaveBeenCalledWith('BUSAN');
  });

  it('renders all 18 regions from constants', () => {
    render(<RegionSelector value={null} onChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(REGIONS.length);
  });
});
