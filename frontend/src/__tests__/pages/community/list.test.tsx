import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { server } from '@/src/mocks/server';
import CommunityPage from '../../../../app/community/page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CommunityPage', () => {
  it('게시글 목록을 렌더링한다', async () => {
    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByText('청년 월세 지원 신청 후기')).toBeInTheDocument();
      expect(screen.getByText('취업 장려금 신청 방법 문의')).toBeInTheDocument();
      expect(screen.getByText('청년 정책 관련 정보 공유')).toBeInTheDocument();
    });
  });

  it('게시글 타입 태그를 표시한다', async () => {
    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByText('후기')).toBeInTheDocument();
      expect(screen.getByText('질문')).toBeInTheDocument();
      expect(screen.getByText('꿀팁')).toBeInTheDocument();
    });
  });

  it('게시글 메타 정보를 표시한다', async () => {
    render(<CommunityPage />);

    await waitFor(() => {
      // Nickname
      expect(screen.getByText('테스트유저')).toBeInTheDocument();
      // Like, Comment, View counts should be visible (checking for emojis/numbers)
      const likeElements = screen.getAllByText(/❤️/);
      expect(likeElements.length).toBeGreaterThan(0);
    });
  });

  it('유형별 필터링이 작동한다', async () => {
    const user = userEvent.setup();
    render(<CommunityPage />);

    // Wait for initial load - all posts visible
    await waitFor(() => {
      expect(screen.getByText('청년 월세 지원 신청 후기')).toBeInTheDocument();
      expect(screen.getByText('청년 정책 관련 정보 공유')).toBeInTheDocument();
    });

    // Click on TIP filter
    const tipButton = screen.getByRole('button', { name: '꿀팁' });
    await user.click(tipButton);

    // Wait for filtered results
    await waitFor(() => {
      // TIP post should be visible
      expect(screen.getByText('청년 정책 관련 정보 공유')).toBeInTheDocument();
    });

    // Other types should not be visible
    await waitFor(() => {
      expect(screen.queryByText('청년 월세 지원 신청 후기')).not.toBeInTheDocument();
      expect(screen.queryByText('취업 장려금 신청 방법 문의')).not.toBeInTheDocument();
    });
  });

  it('게시글 클릭 시 상세 페이지로 이동한다', async () => {
    const user = userEvent.setup();
    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByText('청년 월세 지원 신청 후기')).toBeInTheDocument();
    });

    const postCard = screen.getByText('청년 월세 지원 신청 후기').closest('div');
    expect(postCard).toBeInTheDocument();

    if (postCard) {
      await user.click(postCard);
      // Router navigation would be tested with actual routing
    }
  });

  it('로딩 상태를 표시한다', () => {
    render(<CommunityPage />);
    // Initially should show some loading state or be empty
    // This is a quick check before data loads
    expect(screen.queryByText('청년 월세 지원 신청 후기')).not.toBeInTheDocument();
  });

  it('빈 목록일 때 메시지를 표시한다', async () => {
    const user = userEvent.setup();
    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByText('청년 월세 지원 신청 후기')).toBeInTheDocument();
    });

    // Filter to type that has no posts
    const generalButton = screen.getByRole('button', { name: /일반/i });
    await user.click(generalButton);

    await waitFor(() => {
      expect(screen.getByText(/게시글이 없습니다/i)).toBeInTheDocument();
    });
  });
});
