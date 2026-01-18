import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CommentForm } from '@/src/components/comment/CommentForm';

describe('CommentForm', () => {
  it('폼을 렌더링한다', () => {
    const onSubmit = vi.fn();
    render(<CommentForm onSubmit={onSubmit} />);

    expect(screen.getByPlaceholderText('댓글을 입력하세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /등록/i })).toBeInTheDocument();
  });

  it('내용을 입력할 수 있다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CommentForm onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText('댓글을 입력하세요');
    await user.type(textarea, '좋은 정보 감사합니다');

    expect(textarea).toHaveValue('좋은 정보 감사합니다');
  });

  it('닉네임을 입력할 수 있다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CommentForm onSubmit={onSubmit} showNickname />);

    const nicknameInput = screen.getByPlaceholderText('닉네임 (선택)');
    await user.type(nicknameInput, '테스트유저');

    expect(nicknameInput).toHaveValue('테스트유저');
  });

  it('제출 시 onSubmit이 호출된다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CommentForm onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText('댓글을 입력하세요');
    await user.type(textarea, '좋은 정보 감사합니다');

    const submitButton = screen.getByRole('button', { name: /등록/i });
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith({
      content: '좋은 정보 감사합니다',
      nickname: undefined,
    });
  });

  it('제출 시 폼이 초기화된다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CommentForm onSubmit={onSubmit} showNickname />);

    const textarea = screen.getByPlaceholderText('댓글을 입력하세요');
    const nicknameInput = screen.getByPlaceholderText('닉네임 (선택)');

    await user.type(textarea, '좋은 정보 감사합니다');
    await user.type(nicknameInput, '테스트유저');

    const submitButton = screen.getByRole('button', { name: /등록/i });
    await user.click(submitButton);

    expect(textarea).toHaveValue('');
    expect(nicknameInput).toHaveValue('');
  });

  it('빈 내용으로 제출할 수 없다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CommentForm onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /등록/i });
    await user.click(submitButton);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('공백만 입력된 경우 제출할 수 없다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CommentForm onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText('댓글을 입력하세요');
    await user.type(textarea, '   ');

    const submitButton = screen.getByRole('button', { name: /등록/i });
    await user.click(submitButton);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('placeholder를 커스터마이징할 수 있다', () => {
    const onSubmit = vi.fn();
    render(<CommentForm onSubmit={onSubmit} placeholder="답글을 입력하세요" />);

    expect(screen.getByPlaceholderText('답글을 입력하세요')).toBeInTheDocument();
  });

  it('버튼 텍스트를 커스터마이징할 수 있다', () => {
    const onSubmit = vi.fn();
    render(<CommentForm onSubmit={onSubmit} buttonText="답글 작성" />);

    expect(screen.getByRole('button', { name: '답글 작성' })).toBeInTheDocument();
  });
});
