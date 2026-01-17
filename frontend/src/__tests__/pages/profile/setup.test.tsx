import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileSetupPage from '@/app/profile/setup/page';
import { useAuthStore } from '@/src/stores/authStore';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('ProfileSetupPage', () => {
  beforeEach(() => {
    mockPush.mockClear();

    // Set authenticated state
    useAuthStore.setState({
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        nickname: '테스트유저',
        profileImage: null,
        createdAt: Date.now() / 1000,
      },
      isAuthenticated: true,
    });
  });

  it('renders all three sections', () => {
    render(<ProfileSetupPage />);

    expect(screen.getByText(/나이대를 선택해주세요/i)).toBeInTheDocument();
    expect(screen.getByText(/거주 지역을 선택해주세요/i)).toBeInTheDocument();
    expect(screen.getByText(/관심 분야를 선택해주세요/i)).toBeInTheDocument();
  });

  it('shows step progress indicators', () => {
    render(<ProfileSetupPage />);

    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getByText('2/3')).toBeInTheDocument();
    expect(screen.getByText('3/3')).toBeInTheDocument();
  });

  it('disables save button when no interest is selected', () => {
    render(<ProfileSetupPage />);

    const saveButton = screen.getByRole('button', { name: /저장하기/i });
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when at least one interest is selected', () => {
    render(<ProfileSetupPage />);

    fireEvent.click(screen.getByText('취업·일자리'));

    const saveButton = screen.getByRole('button', { name: /저장하기/i });
    expect(saveButton).toBeEnabled();
  });

  it('saves preferences and redirects to home on success', async () => {
    render(<ProfileSetupPage />);

    // Select age
    fireEvent.click(screen.getByText('20대'));

    // Select region
    fireEvent.click(screen.getByText('서울'));

    // Select interests
    fireEvent.click(screen.getByText('취업·일자리'));
    fireEvent.click(screen.getByText('주거·임대'));

    // Click save
    const saveButton = screen.getByRole('button', { name: /저장하기/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows loading state during save', async () => {
    render(<ProfileSetupPage />);

    fireEvent.click(screen.getByText('취업·일자리'));

    const saveButton = screen.getByRole('button', { name: /저장하기/i });
    fireEvent.click(saveButton);

    expect(screen.getByText(/저장 중.../i)).toBeInTheDocument();
  });

  it('shows error message on save failure', async () => {
    // Mock unauthorized response
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });

    render(<ProfileSetupPage />);

    fireEvent.click(screen.getByText('취업·일자리'));

    const saveButton = screen.getByRole('button', { name: /저장하기/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/설정 저장에 실패했습니다/i)).toBeInTheDocument();
    });
  });

  it('allows multiple interest selection', () => {
    render(<ProfileSetupPage />);

    fireEvent.click(screen.getByText('취업·일자리'));
    fireEvent.click(screen.getByText('주거·임대'));
    fireEvent.click(screen.getByText('교육·장학'));

    const job = screen.getByText('취업·일자리').closest('button');
    const housing = screen.getByText('주거·임대').closest('button');
    const education = screen.getByText('교육·장학').closest('button');

    expect(job).toHaveClass('bg-blue-600');
    expect(housing).toHaveClass('bg-blue-600');
    expect(education).toHaveClass('bg-blue-600');
  });
});
