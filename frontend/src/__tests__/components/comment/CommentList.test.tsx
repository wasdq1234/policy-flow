import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CommentList } from '@/src/components/comment/CommentList';
import { useComments } from '@/src/hooks/useComments';
import { useAuthStore } from '@/src/stores/authStore';
import type { CommentItem } from '@policy-flow/contracts';

// Mock hooks
vi.mock('@/src/hooks/useComments');
vi.mock('@/src/stores/authStore');

const mockComments: CommentItem[] = [
  {
    id: 1,
    content: '좋은 정보 감사합니다',
    nickname: '테스트유저1',
    parentId: null,
    likeCount: 5,
    createdAt: Date.now() - 1000 * 60 * 60,
    isAuthor: false,
  },
  {
    id: 2,
    content: '저도 도움이 되었어요',
    nickname: '테스트유저2',
    parentId: 1,
    likeCount: 2,
    createdAt: Date.now() - 1000 * 60 * 30,
    isAuthor: false,
  },
  {
    id: 3,
    content: '궁금한 점이 있어요',
    nickname: '테스트유저3',
    parentId: null,
    likeCount: 1,
    createdAt: Date.now() - 1000 * 60 * 10,
    isAuthor: false,
  },
];

describe('CommentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('댓글 목록을 렌더링한다', () => {
    vi.mocked(useComments).mockReturnValue({
      comments: mockComments,
      isLoading: false,
      error: null,
      createComment: vi.fn(),
      deleteComment: vi.fn(),
      refetch: vi.fn(),
    });

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      refreshToken: 'refresh',
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    render(<CommentList postId="1" />);

    expect(screen.getByText('좋은 정보 감사합니다')).toBeInTheDocument();
    expect(screen.getByText('저도 도움이 되었어요')).toBeInTheDocument();
    expect(screen.getByText('궁금한 점이 있어요')).toBeInTheDocument();
  });

  it('댓글 개수를 표시한다', () => {
    vi.mocked(useComments).mockReturnValue({
      comments: mockComments,
      isLoading: false,
      error: null,
      createComment: vi.fn(),
      deleteComment: vi.fn(),
      refetch: vi.fn(),
    });

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      refreshToken: 'refresh',
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    render(<CommentList postId="1" />);

    expect(screen.getByText('댓글 3')).toBeInTheDocument();
  });

  it('빈 댓글 목록을 표시한다', () => {
    vi.mocked(useComments).mockReturnValue({
      comments: [],
      isLoading: false,
      error: null,
      createComment: vi.fn(),
      deleteComment: vi.fn(),
      refetch: vi.fn(),
    });

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      refreshToken: 'refresh',
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    render(<CommentList postId="1" />);

    expect(screen.getByText('아직 댓글이 없습니다')).toBeInTheDocument();
  });

  it('로딩 상태를 표시한다', () => {
    vi.mocked(useComments).mockReturnValue({
      comments: [],
      isLoading: true,
      error: null,
      createComment: vi.fn(),
      deleteComment: vi.fn(),
      refetch: vi.fn(),
    });

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      refreshToken: 'refresh',
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    render(<CommentList postId="1" />);

    expect(screen.getByText('댓글을 불러오는 중...')).toBeInTheDocument();
  });

  it('에러 상태를 표시한다', () => {
    vi.mocked(useComments).mockReturnValue({
      comments: [],
      isLoading: false,
      error: '댓글을 불러오는데 실패했습니다',
      createComment: vi.fn(),
      deleteComment: vi.fn(),
      refetch: vi.fn(),
    });

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      refreshToken: 'refresh',
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    render(<CommentList postId="1" />);

    expect(screen.getByText('댓글을 불러오는데 실패했습니다')).toBeInTheDocument();
  });

  it('로그인 상태에서 댓글 작성 폼을 표시한다', () => {
    vi.mocked(useComments).mockReturnValue({
      comments: [],
      isLoading: false,
      error: null,
      createComment: vi.fn(),
      deleteComment: vi.fn(),
      refetch: vi.fn(),
    });

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      refreshToken: 'refresh',
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    render(<CommentList postId="1" />);

    expect(screen.getByPlaceholderText('댓글을 입력하세요')).toBeInTheDocument();
  });

  it('비로그인 상태에서 로그인 유도 메시지를 표시한다', () => {
    vi.mocked(useComments).mockReturnValue({
      comments: [],
      isLoading: false,
      error: null,
      createComment: vi.fn(),
      deleteComment: vi.fn(),
      refetch: vi.fn(),
    });

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    render(<CommentList postId="1" />);

    expect(screen.getByText(/로그인이 필요합니다/)).toBeInTheDocument();
  });

  it('댓글을 작성할 수 있다', async () => {
    const user = userEvent.setup();
    const createComment = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useComments).mockReturnValue({
      comments: [],
      isLoading: false,
      error: null,
      createComment,
      deleteComment: vi.fn(),
      refetch: vi.fn(),
    });

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      refreshToken: 'refresh',
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    render(<CommentList postId="1" />);

    const textarea = screen.getByPlaceholderText('댓글을 입력하세요');
    await user.type(textarea, '새 댓글입니다');

    const submitButton = screen.getByRole('button', { name: /등록/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(createComment).toHaveBeenCalledWith('새 댓글입니다', undefined);
    });
  });

  it('답글 버튼 클릭 시 답글 폼을 표시한다', async () => {
    const user = userEvent.setup();

    vi.mocked(useComments).mockReturnValue({
      comments: [mockComments[0]],
      isLoading: false,
      error: null,
      createComment: vi.fn(),
      deleteComment: vi.fn(),
      refetch: vi.fn(),
    });

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      refreshToken: 'refresh',
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    render(<CommentList postId="1" />);

    const replyButton = screen.getByRole('button', { name: /답글/i });
    await user.click(replyButton);

    expect(screen.getByPlaceholderText('답글을 입력하세요')).toBeInTheDocument();
  });

  it('답글을 작성할 수 있다', async () => {
    const user = userEvent.setup();
    const createComment = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useComments).mockReturnValue({
      comments: [mockComments[0]],
      isLoading: false,
      error: null,
      createComment,
      deleteComment: vi.fn(),
      refetch: vi.fn(),
    });

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      refreshToken: 'refresh',
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    render(<CommentList postId="1" />);

    const replyButton = screen.getByRole('button', { name: /답글/i });
    await user.click(replyButton);

    const replyTextarea = screen.getByPlaceholderText('답글을 입력하세요');
    await user.type(replyTextarea, '답글입니다');

    const submitButtons = screen.getAllByRole('button', { name: /등록/i });
    // Click the second button (reply form submit button)
    await user.click(submitButtons[1]);

    await waitFor(() => {
      expect(createComment).toHaveBeenCalledWith('답글입니다', undefined, 1);
    });
  });

  it('댓글을 삭제할 수 있다', async () => {
    const user = userEvent.setup();
    const deleteComment = vi.fn().mockResolvedValue(undefined);

    const authorComment = { ...mockComments[0], isAuthor: true };

    vi.mocked(useComments).mockReturnValue({
      comments: [authorComment],
      isLoading: false,
      error: null,
      createComment: vi.fn(),
      deleteComment,
      refetch: vi.fn(),
    });

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      refreshToken: 'refresh',
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CommentList postId="1" />);

    const deleteButton = screen.getByRole('button', { name: /삭제/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(deleteComment).toHaveBeenCalledWith(1);
    });

    confirmSpy.mockRestore();
  });

  it('대댓글이 들여쓰기되어 표시된다', () => {
    const commentsWithReplies = [
      mockComments[0],
      mockComments[1], // parentId: 1
    ];

    vi.mocked(useComments).mockReturnValue({
      comments: commentsWithReplies,
      isLoading: false,
      error: null,
      createComment: vi.fn(),
      deleteComment: vi.fn(),
      refetch: vi.fn(),
    });

    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      user: null,
      accessToken: 'token',
      refreshToken: 'refresh',
      setAuth: vi.fn(),
      clearAuth: vi.fn(),
    });

    const { container } = render(<CommentList postId="1" />);

    const indentedComments = container.querySelectorAll('.pl-8');
    expect(indentedComments.length).toBe(1);
  });
});
