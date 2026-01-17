import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import LoginPage from '@/src/app/auth/login/page';
import { useAuthStore } from '@/src/stores/authStore';

// Mock router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    // Reset store and mocks
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    localStorage.clear();
    mockPush.mockClear();
  });

  it('웰컴 화면을 렌더링해야 한다', () => {
    render(<LoginPage />);

    expect(screen.getByText('PolicyFlow KR')).toBeInTheDocument();
    expect(screen.getByText(/청년을 위한 정책 정보/i)).toBeInTheDocument();
  });

  it('Google 로그인 버튼을 표시해야 한다', () => {
    render(<LoginPage />);

    const googleButton = screen.getByRole('button', { name: /Google로 계속하기/i });
    expect(googleButton).toBeInTheDocument();
  });

  it('Kakao 로그인 버튼을 표시해야 한다', () => {
    render(<LoginPage />);

    const kakaoButton = screen.getByRole('button', { name: /Kakao로 계속하기/i });
    expect(kakaoButton).toBeInTheDocument();
  });

  it('Google 로그인 버튼 클릭 시 로그인 프로세스가 시작되어야 한다', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const googleButton = screen.getByRole('button', { name: /Google로 계속하기/i });
    await user.click(googleButton);

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('Kakao 로그인 버튼 클릭 시 로그인 프로세스가 시작되어야 한다', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const kakaoButton = screen.getByRole('button', { name: /Kakao로 계속하기/i });
    await user.click(kakaoButton);

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('로그인 실패 시 에러 메시지를 표시해야 한다', async () => {
    const user = userEvent.setup();

    // Mock fetch to simulate login failure
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { code: 'INVALID_TOKEN', message: 'Invalid token' } }),
    });

    render(<LoginPage />);

    const googleButton = screen.getByRole('button', { name: /Google로 계속하기/i });
    await user.click(googleButton);

    await waitFor(() => {
      expect(screen.getByText(/로그인에 실패했습니다/i)).toBeInTheDocument();
    });
  });

  it('로그인 중에는 버튼이 비활성화되어야 한다', async () => {
    const user = userEvent.setup();

    // Mock slow fetch
    global.fetch = vi.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({
          data: {
            accessToken: 'token',
            refreshToken: 'refresh',
            expiresIn: 3600,
            user: {
              id: 'user-1',
              email: 'test@example.com',
              nickname: '테스트',
              profileImage: null,
              createdAt: Date.now(),
            }
          }
        })
      }), 100))
    );

    render(<LoginPage />);

    const googleButton = screen.getByRole('button', { name: /Google로 계속하기/i });
    const kakaoButton = screen.getByRole('button', { name: /Kakao로 계속하기/i });

    await user.click(googleButton);

    // Buttons should be disabled during login
    await waitFor(() => {
      expect(googleButton).toBeDisabled();
      expect(kakaoButton).toBeDisabled();
    });
  });
});
