import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { server } from '@/src/mocks/server';
import PostDetailPage from '../../../../app/community/[id]/page';

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

describe('PostDetailPage', () => {
  it('게시글 상세 정보를 렌더링한다', async () => {
    render(<PostDetailPage params={{ id: '1' }} />);

    await waitFor(() => {
      expect(screen.getByText('청년 월세 지원 신청 후기')).toBeInTheDocument();
      expect(screen.getByText('신청 과정이 생각보다 간단했어요...')).toBeInTheDocument();
    });
  });

  it('게시글 타입 태그를 표시한다', async () => {
    render(<PostDetailPage params={{ id: '1' }} />);

    await waitFor(() => {
      expect(screen.getByText('후기')).toBeInTheDocument();
    });
  });

  it('게시글 메타 정보를 표시한다', async () => {
    render(<PostDetailPage params={{ id: '1' }} />);

    await waitFor(() => {
      expect(screen.getByText('테스트유저')).toBeInTheDocument();
      expect(screen.getByText(/조회/i)).toBeInTheDocument();
    });
  });

  it('좋아요 버튼을 표시한다', async () => {
    render(<PostDetailPage params={{ id: '1' }} />);

    await waitFor(() => {
      const likeButton = screen.getByRole('button', { name: /좋아요/i });
      expect(likeButton).toBeInTheDocument();
    });
  });

  it('좋아요 토글이 작동한다', async () => {
    const user = userEvent.setup();
    render(<PostDetailPage params={{ id: '1' }} />);

    await waitFor(() => {
      expect(screen.getByText('청년 월세 지원 신청 후기')).toBeInTheDocument();
    });

    const likeButton = screen.getByRole('button', { name: /좋아요/i });
    await user.click(likeButton);

    await waitFor(() => {
      // Like count should change (mock returns 13)
      expect(screen.getByText('13')).toBeInTheDocument();
    });
  });

  it('목록으로 돌아가기 버튼을 표시한다', async () => {
    render(<PostDetailPage params={{ id: '1' }} />);

    await waitFor(() => {
      expect(screen.getByText('청년 월세 지원 신청 후기')).toBeInTheDocument();
    });

    const backButtons = screen.getAllByRole('button', { name: /목록/i });
    expect(backButtons.length).toBe(2);
  });

  it('목록으로 버튼 클릭 시 이동한다', async () => {
    const user = userEvent.setup();
    render(<PostDetailPage params={{ id: '1' }} />);

    await waitFor(() => {
      expect(screen.getByText('청년 월세 지원 신청 후기')).toBeInTheDocument();
    });

    const backButtons = screen.getAllByRole('button', { name: /목록/i });
    // Should have 2 back buttons (one at top, one at bottom)
    expect(backButtons.length).toBe(2);

    // Click the bottom one
    await user.click(backButtons[1]);

    // Should call router.push
    expect(mockPush).toHaveBeenCalledWith('/community');
  });

  it('존재하지 않는 게시글에 대한 에러를 처리한다', async () => {
    render(<PostDetailPage params={{ id: '999' }} />);

    await waitFor(() => {
      expect(screen.getByText(/게시글을 찾을 수 없습니다/i)).toBeInTheDocument();
    });
  });

  it('로딩 상태를 표시한다', () => {
    render(<PostDetailPage params={{ id: '1' }} />);
    // Initially should show loading state
    expect(screen.queryByText('청년 월세 지원 신청 후기')).not.toBeInTheDocument();
  });
});
