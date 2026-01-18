import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CommentItem } from '@/src/components/comment/CommentItem';
import type { CommentItem as CommentType } from '@policy-flow/contracts';

const mockComment: CommentType = {
  id: 1,
  content: '좋은 정보 감사합니다',
  nickname: '테스트유저',
  parentId: null,
  likeCount: 5,
  createdAt: Date.now(),
  isLikedByMe: false,
  isAuthor: false,
};

describe('CommentItem', () => {
  it('댓글 정보를 표시한다', () => {
    render(<CommentItem comment={mockComment} onReply={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('테스트유저')).toBeInTheDocument();
    expect(screen.getByText('좋은 정보 감사합니다')).toBeInTheDocument();
  });

  it('익명 댓글인 경우 익명 표시한다', () => {
    const anonymousComment = { ...mockComment, nickname: null };
    render(<CommentItem comment={anonymousComment} onReply={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('익명')).toBeInTheDocument();
  });

  it('답글 버튼을 표시한다', () => {
    render(<CommentItem comment={mockComment} onReply={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByRole('button', { name: /답글/i })).toBeInTheDocument();
  });

  it('답글 버튼 클릭 시 onReply가 호출된다', async () => {
    const user = userEvent.setup();
    const onReply = vi.fn();
    render(<CommentItem comment={mockComment} onReply={onReply} onDelete={vi.fn()} />);

    const replyButton = screen.getByRole('button', { name: /답글/i });
    await user.click(replyButton);

    expect(onReply).toHaveBeenCalledWith(mockComment.id);
  });

  it('작성자인 경우 삭제 버튼을 표시한다', () => {
    const authorComment = { ...mockComment, isAuthor: true };
    render(<CommentItem comment={authorComment} onReply={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByRole('button', { name: /삭제/i })).toBeInTheDocument();
  });

  it('작성자가 아닌 경우 삭제 버튼을 표시하지 않는다', () => {
    render(<CommentItem comment={mockComment} onReply={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /삭제/i })).not.toBeInTheDocument();
  });

  it('삭제 버튼 클릭 시 확인 후 onDelete가 호출된다', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const authorComment = { ...mockComment, isAuthor: true };

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CommentItem comment={authorComment} onReply={vi.fn()} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /삭제/i });
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith('댓글을 삭제하시겠습니까?');
    expect(onDelete).toHaveBeenCalledWith(mockComment.id);

    confirmSpy.mockRestore();
  });

  it('삭제 확인을 취소하면 onDelete가 호출되지 않는다', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const authorComment = { ...mockComment, isAuthor: true };

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<CommentItem comment={authorComment} onReply={vi.fn()} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /삭제/i });
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('대댓글인 경우 들여쓰기가 적용된다', () => {
    const replyComment = { ...mockComment, parentId: 1 };
    const { container } = render(
      <CommentItem comment={replyComment} onReply={vi.fn()} onDelete={vi.fn()} />
    );

    const commentDiv = container.querySelector('.pl-8');
    expect(commentDiv).toBeInTheDocument();
  });

  it('일반 댓글인 경우 들여쓰기가 적용되지 않는다', () => {
    const { container } = render(
      <CommentItem comment={mockComment} onReply={vi.fn()} onDelete={vi.fn()} />
    );

    const commentDiv = container.querySelector('.pl-8');
    expect(commentDiv).not.toBeInTheDocument();
  });

  it('시간 정보를 표시한다', () => {
    render(<CommentItem comment={mockComment} onReply={vi.fn()} onDelete={vi.fn()} />);

    // Should display time (e.g., "방금 전", "1분 전", etc.)
    const timeElement = screen.getByText(/전$/);
    expect(timeElement).toBeInTheDocument();
  });
});
