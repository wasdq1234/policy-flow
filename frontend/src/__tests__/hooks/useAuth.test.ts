import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/src/hooks/useAuth';
import { useAuthStore } from '@/src/stores/authStore';

// Mock router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('useAuth', () => {
  beforeEach(() => {
    // Reset store and localStorage
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    localStorage.clear();
    mockPush.mockClear();
    vi.clearAllMocks();
  });

  it('초기 상태는 비인증 상태여야 한다', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('login 성공 시 사용자 정보를 저장하고 메인으로 이동해야 한다', async () => {
    const { result } = renderHook(() => useAuth());

    await result.current.login('google', 'valid-token');

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.id).toBe('user-1');
    expect(result.current.user?.nickname).toBe('테스트유저');
    expect(result.current.error).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('login 실패 시 에러를 설정해야 한다', async () => {
    const { result } = renderHook(() => useAuth());

    await result.current.login('google', 'invalid-token');

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('로그인에 실패했습니다. 다시 시도해주세요.');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('login 완료 후에는 isLoading이 false여야 한다', async () => {
    const { result } = renderHook(() => useAuth());

    await result.current.login('google', 'valid-token');

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('logout 시 인증 정보를 삭제하고 로그인 페이지로 이동해야 한다', async () => {
    const { result } = renderHook(() => useAuth());

    // 먼저 로그인
    await result.current.login('google', 'valid-token');

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    mockPush.mockClear();

    // 로그아웃
    await result.current.logout();

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });
});
