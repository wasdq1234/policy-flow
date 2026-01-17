// TabBar component tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TabBar from '../../components/layout/TabBar';

// Mock usePathname at module level
const usePathnameMock = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

describe('TabBar', () => {
  beforeEach(() => {
    // Default mock return value
    usePathnameMock.mockReturnValue('/');
  });

  it('renders three navigation items', () => {
    render(<TabBar />);

    expect(screen.getByText('캘린더')).toBeInTheDocument();
    expect(screen.getByText('커뮤니티')).toBeInTheDocument();
    expect(screen.getByText('마이페이지')).toBeInTheDocument();
  });

  it('renders with correct icons', () => {
    render(<TabBar />);

    expect(screen.getByText('📅')).toBeInTheDocument();
    expect(screen.getByText('💬')).toBeInTheDocument();
    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('highlights the current page (home)', () => {
    usePathnameMock.mockReturnValue('/');

    render(<TabBar />);

    const calendarLink = screen.getByText('캘린더').closest('a');
    expect(calendarLink).toHaveClass('text-primary-600');

    const communityLink = screen.getByText('커뮤니티').closest('a');
    expect(communityLink).toHaveClass('text-gray-400');

    const mypageLink = screen.getByText('마이페이지').closest('a');
    expect(mypageLink).toHaveClass('text-gray-400');
  });

  it('highlights the current page (community)', () => {
    usePathnameMock.mockReturnValue('/community');

    render(<TabBar />);

    const calendarLink = screen.getByText('캘린더').closest('a');
    expect(calendarLink).toHaveClass('text-gray-400');

    const communityLink = screen.getByText('커뮤니티').closest('a');
    expect(communityLink).toHaveClass('text-primary-600');
  });

  it('highlights the current page (mypage)', () => {
    usePathnameMock.mockReturnValue('/mypage');

    render(<TabBar />);

    const calendarLink = screen.getByText('캘린더').closest('a');
    expect(calendarLink).toHaveClass('text-gray-400');

    const mypageLink = screen.getByText('마이페이지').closest('a');
    expect(mypageLink).toHaveClass('text-primary-600');
  });

  it('renders navigation links with correct hrefs', () => {
    render(<TabBar />);

    const calendarLink = screen.getByText('캘린더').closest('a');
    expect(calendarLink).toHaveAttribute('href', '/');

    const communityLink = screen.getByText('커뮤니티').closest('a');
    expect(communityLink).toHaveAttribute('href', '/community');

    const mypageLink = screen.getByText('마이페이지').closest('a');
    expect(mypageLink).toHaveAttribute('href', '/mypage');
  });

  it('has mobile-only visibility class', () => {
    const { container } = render(<TabBar />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('md:hidden');
  });

  it('is fixed at the bottom', () => {
    const { container } = render(<TabBar />);

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('fixed', 'bottom-0');
  });
});
