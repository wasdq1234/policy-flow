import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BookmarkButton } from '@/src/components/bookmark/BookmarkButton';
import { useAuthStore } from '@/src/stores/authStore';
import { useBookmarkStore } from '@/src/stores/bookmarkStore';

vi.mock('@/src/stores/authStore');
vi.mock('@/src/stores/bookmarkStore');

describe('BookmarkButton', () => {
  const mockToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: authenticated user
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      accessToken: 'mock-token',
      user: null,
      refreshToken: null,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    // Default: not bookmarked, not loading
    vi.mocked(useBookmarkStore).mockReturnValue({
      bookmarks: [],
      bookmarkedPolicyIds: new Set(),
      isLoading: false,
      error: null,
      setBookmarks: vi.fn(),
      addBookmark: vi.fn(),
      removeBookmark: vi.fn(),
      isBookmarked: vi.fn(() => false),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearBookmarks: vi.fn(),
    });
  });

  it('북마크 안된 상태를 렌더링해야 한다', () => {
    render(<BookmarkButton policyId="policy-1" onToggle={mockToggle} />);

    const button = screen.getByRole('button', { name: /북마크/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('text-gray-400');
  });

  it('북마크된 상태를 렌더링해야 한다', () => {
    vi.mocked(useBookmarkStore).mockReturnValue({
      bookmarks: [],
      bookmarkedPolicyIds: new Set(['policy-1']),
      isLoading: false,
      error: null,
      setBookmarks: vi.fn(),
      addBookmark: vi.fn(),
      removeBookmark: vi.fn(),
      isBookmarked: vi.fn(() => true),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearBookmarks: vi.fn(),
    });

    render(<BookmarkButton policyId="policy-1" onToggle={mockToggle} />);

    const button = screen.getByRole('button', { name: /북마크됨/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('text-red-500');
  });

  it('클릭 시 onToggle 콜백이 호출되어야 한다', async () => {
    const user = userEvent.setup();
    render(<BookmarkButton policyId="policy-1" onToggle={mockToggle} />);

    const button = screen.getByRole('button', { name: /북마크/i });
    await user.click(button);

    expect(mockToggle).toHaveBeenCalledWith('policy-1');
  });

  it('로딩 중일 때 버튼이 비활성화되어야 한다', () => {
    vi.mocked(useBookmarkStore).mockReturnValue({
      bookmarks: [],
      bookmarkedPolicyIds: new Set(),
      isLoading: true,
      error: null,
      setBookmarks: vi.fn(),
      addBookmark: vi.fn(),
      removeBookmark: vi.fn(),
      isBookmarked: vi.fn(() => false),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearBookmarks: vi.fn(),
    });

    render(<BookmarkButton policyId="policy-1" onToggle={mockToggle} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('비로그인 상태일 때 버튼을 클릭하면 경고를 표시해야 한다', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      accessToken: null,
      user: null,
      refreshToken: null,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    render(<BookmarkButton policyId="policy-1" onToggle={mockToggle} />);

    const button = screen.getByRole('button', { name: /북마크/i });
    await user.click(button);

    expect(alertSpy).toHaveBeenCalledWith('로그인이 필요합니다.');
    expect(mockToggle).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('비로그인 상태에서도 북마크 상태는 표시되어야 한다', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      accessToken: null,
      user: null,
      refreshToken: null,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    vi.mocked(useBookmarkStore).mockReturnValue({
      bookmarks: [],
      bookmarkedPolicyIds: new Set(['policy-1']),
      isLoading: false,
      error: null,
      setBookmarks: vi.fn(),
      addBookmark: vi.fn(),
      removeBookmark: vi.fn(),
      isBookmarked: vi.fn(() => true),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearBookmarks: vi.fn(),
    });

    render(<BookmarkButton policyId="policy-1" onToggle={mockToggle} />);

    const button = screen.getByRole('button', { name: /북마크됨/i });
    expect(button).toBeInTheDocument();
  });
});
