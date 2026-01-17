import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/src/stores/authStore';
import type { LoginResponse } from '@policy-flow/contracts';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    localStorage.clear();
  });

  it('초기 상태는 비인증 상태여야 한다', () => {
    const { user, accessToken, refreshToken, isAuthenticated } = useAuthStore.getState();

    expect(user).toBeNull();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('setAuth로 로그인 정보를 설정해야 한다', () => {
    const mockAuthData: LoginResponse = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresIn: 3600,
      user: {
        id: 'user-1',
        email: 'test@example.com',
        nickname: '테스트유저',
        profileImage: null,
        createdAt: Math.floor(Date.now() / 1000),
      },
    };

    useAuthStore.getState().setAuth(mockAuthData);

    const { user, accessToken, refreshToken, isAuthenticated } = useAuthStore.getState();

    expect(user).toEqual(mockAuthData.user);
    expect(accessToken).toBe(mockAuthData.accessToken);
    expect(refreshToken).toBe(mockAuthData.refreshToken);
    expect(isAuthenticated).toBe(true);
  });

  it('setAuth는 토큰을 localStorage에 저장해야 한다', () => {
    const mockAuthData: LoginResponse = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresIn: 3600,
      user: {
        id: 'user-1',
        email: 'test@example.com',
        nickname: '테스트유저',
        profileImage: null,
        createdAt: Math.floor(Date.now() / 1000),
      },
    };

    useAuthStore.getState().setAuth(mockAuthData);

    expect(localStorage.getItem('accessToken')).toBe('test-access-token');
    expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token');
  });

  it('clearAuth로 로그아웃 처리를 해야 한다', () => {
    const mockAuthData: LoginResponse = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresIn: 3600,
      user: {
        id: 'user-1',
        email: 'test@example.com',
        nickname: '테스트유저',
        profileImage: null,
        createdAt: Math.floor(Date.now() / 1000),
      },
    };

    // 먼저 로그인
    useAuthStore.getState().setAuth(mockAuthData);

    // 로그아웃
    useAuthStore.getState().clearAuth();

    const { user, accessToken, refreshToken, isAuthenticated } = useAuthStore.getState();

    expect(user).toBeNull();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('clearAuth는 localStorage에서 토큰을 제거해야 한다', () => {
    const mockAuthData: LoginResponse = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresIn: 3600,
      user: {
        id: 'user-1',
        email: 'test@example.com',
        nickname: '테스트유저',
        profileImage: null,
        createdAt: Math.floor(Date.now() / 1000),
      },
    };

    useAuthStore.getState().setAuth(mockAuthData);
    useAuthStore.getState().clearAuth();

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});
