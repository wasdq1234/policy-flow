import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PostForm } from '../../../components/post/PostForm';

describe('PostForm', () => {
  it('should render form fields', () => {
    const mockOnSubmit = vi.fn();
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByText('꿀팁')).toBeInTheDocument();
    expect(screen.getByText('질문')).toBeInTheDocument();
    expect(screen.getByText('후기')).toBeInTheDocument();
    expect(screen.getByLabelText('닉네임')).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('내용')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '작성하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('should select post type', () => {
    const mockOnSubmit = vi.fn();
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} />);

    const tipButton = screen.getByText('꿀팁');
    const questionButton = screen.getByText('질문');

    // Initially TIP is selected (default)
    expect(tipButton).toHaveClass('bg-blue-500');

    // Click QUESTION button
    fireEvent.click(questionButton);
    expect(questionButton).toHaveClass('bg-orange-500');
    expect(tipButton).not.toHaveClass('bg-blue-500');
  });

  it('should fill title input', () => {
    const mockOnSubmit = vi.fn();
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} />);

    const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: '테스트 제목' } });

    expect(titleInput.value).toBe('테스트 제목');
  });

  it('should fill content textarea', () => {
    const mockOnSubmit = vi.fn();
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} />);

    const contentTextarea = screen.getByLabelText('내용') as HTMLTextAreaElement;
    fireEvent.change(contentTextarea, { target: { value: '테스트 내용입니다.' } });

    expect(contentTextarea.value).toBe('테스트 내용입니다.');
  });

  it('should use default nickname', () => {
    const mockOnSubmit = vi.fn();
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} defaultNickname="테스트유저" />);

    const nicknameInput = screen.getByLabelText('닉네임') as HTMLInputElement;
    expect(nicknameInput.value).toBe('테스트유저');
  });

  it('should show error when title is empty', async () => {
    const mockOnSubmit = vi.fn();
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} />);

    const submitButton = screen.getByRole('button', { name: '작성하기' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('제목을 입력해주세요.')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show error when content is empty', async () => {
    const mockOnSubmit = vi.fn();
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} />);

    const titleInput = screen.getByLabelText('제목');
    fireEvent.change(titleInput, { target: { value: '제목' } });

    const submitButton = screen.getByRole('button', { name: '작성하기' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('내용을 입력해주세요.')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<PostForm onSubmit={mockOnSubmit} isLoading={false} defaultNickname="테스터" />);

    // Select type
    const questionButton = screen.getByText('질문');
    fireEvent.click(questionButton);

    // Fill form
    const titleInput = screen.getByLabelText('제목');
    fireEvent.change(titleInput, { target: { value: '질문 제목' } });

    const contentTextarea = screen.getByLabelText('내용');
    fireEvent.change(contentTextarea, { target: { value: '질문 내용입니다.' } });

    // Submit
    const submitButton = screen.getByRole('button', { name: '작성하기' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        type: 'QUESTION',
        title: '질문 제목',
        content: '질문 내용입니다.',
        authorNickname: '테스터',
      });
    });
  });

  it('should disable submit button when loading', () => {
    const mockOnSubmit = vi.fn();
    render(<PostForm onSubmit={mockOnSubmit} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: '작성 중...' });
    expect(submitButton).toBeDisabled();
  });

  it('should show loading text when submitting', () => {
    const mockOnSubmit = vi.fn();
    render(<PostForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByText('작성 중...')).toBeInTheDocument();
  });
});
