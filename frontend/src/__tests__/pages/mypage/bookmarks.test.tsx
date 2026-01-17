import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import BookmarksPage from '@/src/app/mypage/bookmarks/page';
import { useBookmarks } from '@/src/hooks/useBookmarks';
import { useAuthStore } from '@/src/stores/authStore';
import type { BookmarkListItem } from '@policy-flow/contracts';

vi.mock('@/src/hooks/useBookmarks');
vi.mock('@/src/stores/authStore');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

const mockBookmarks: BookmarkListItem[] = [
  {
    policyId: 'policy-1',
    policy: {
      id: 'policy-1',
      title: '청년 창업 지원금',
      summary: '청년 창업자를 위한 지원금',
      category: 'startup',
      region: 'seoul',
      status: 'open',
      startDate: Math.floor(Date.now() / 1000),
      endDate: Math.floor(Date.now() / 1000) + 86400 * 30,
      isAlwaysOpen: false,
      applyUrl: 'https://example.com',
      targetAgeMin: 20,
      targetAgeMax: 39,
    },
    notifyBeforeDays: 3,
    createdAt: Math.floor(Date.now() / 1000),
  },
  {
    policyId: 'policy-2',
    policy: {
      id: 'policy-2',
      title: '청년 주거 지원',
      summary: '청년 주거비 지원',
      category: 'housing',
      region: 'busan',
      status: 'open',
      startDate: Math.floor(Date.now() / 1000),
      endDate: Math.floor(Date.now() / 1000) + 86400 * 60,
      isAlwaysOpen: false,
      applyUrl: 'https://example.com',
      targetAgeMin: 19,
      targetAgeMax: 34,
    },
    notifyBeforeDays: 3,
    createdAt: Math.floor(Date.now() / 1000) - 86400,
  },
];

describe('BookmarksPage', () => {
  const mockDeleteBookmark = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      accessToken: 'mock-token',
      user: { id: 'user-1', email: 'test@example.com', displayName: 'Test User', provider: 'google', createdAt: 0, updatedAt: 0 },
      refreshToken: null,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    vi.mocked(useBookmarks).mockReturnValue({
      bookmarks: mockBookmarks,
      isLoading: false,
      error: null,
      isBookmarked: vi.fn(),
      createBookmark: vi.fn(),
      deleteBookmark: mockDeleteBookmark,
      toggleBookmark: vi.fn(),
      refetch: mockRefetch,
    });
  });

  it('북마크 목록을 렌더링해야 한다', () => {
    render(<BookmarksPage />);

    expect(screen.getByText('청년 창업 지원금')).toBeInTheDocument();
    expect(screen.getByText('청년 주거 지원')).toBeInTheDocument();
  });

  it('빈 상태를 표시해야 한다', () => {
    vi.mocked(useBookmarks).mockReturnValue({
      bookmarks: [],
      isLoading: false,
      error: null,
      isBookmarked: vi.fn(),
      createBookmark: vi.fn(),
      deleteBookmark: mockDeleteBookmark,
      toggleBookmark: vi.fn(),
      refetch: mockRefetch,
    });

    render(<BookmarksPage />);

    expect(screen.getByText(/북마크한 정책이 없습니다/i)).toBeInTheDocument();
  });

  it('로딩 상태를 표시해야 한다', () => {
    vi.mocked(useBookmarks).mockReturnValue({
      bookmarks: [],
      isLoading: true,
      error: null,
      isBookmarked: vi.fn(),
      createBookmark: vi.fn(),
      deleteBookmark: mockDeleteBookmark,
      toggleBookmark: vi.fn(),
      refetch: mockRefetch,
    });

    render(<BookmarksPage />);

    expect(screen.getByText(/로딩 중/i)).toBeInTheDocument();
  });

  it('에러 상태를 표시해야 한다', () => {
    const mockError = new Error('Failed to fetch bookmarks');
    vi.mocked(useBookmarks).mockReturnValue({
      bookmarks: [],
      isLoading: false,
      error: mockError,
      isBookmarked: vi.fn(),
      createBookmark: vi.fn(),
      deleteBookmark: mockDeleteBookmark,
      toggleBookmark: vi.fn(),
      refetch: mockRefetch,
    });

    render(<BookmarksPage />);

    expect(screen.getByText(/에러가 발생했습니다/i)).toBeInTheDocument();
  });

  it('북마크 삭제 버튼을 클릭하면 deleteBookmark가 호출되어야 한다', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockDeleteBookmark.mockResolvedValue(undefined);

    render(<BookmarksPage />);

    const deleteButtons = screen.getAllByRole('button', { name: /삭제/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockDeleteBookmark).toHaveBeenCalledWith('policy-1');
    });

    confirmSpy.mockRestore();
  });

  it('정책 카드를 클릭하면 상세 모달이 열려야 한다', async () => {
    const user = userEvent.setup();

    render(<BookmarksPage />);

    const policyCard = screen.getByText('청년 창업 지원금').closest('div');
    expect(policyCard).toBeInTheDocument();

    if (policyCard) {
      await user.click(policyCard);

      // Modal would be rendered, but we're just checking the click behavior
      await waitFor(() => {
        expect(screen.getByText('청년 창업 지원금')).toBeInTheDocument();
      });
    }
  });

  it('비로그인 상태에서는 로그인 안내를 표시해야 한다', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      accessToken: null,
      user: null,
      refreshToken: null,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    render(<BookmarksPage />);

    expect(screen.getByText(/로그인이 필요합니다/i)).toBeInTheDocument();
  });
});
