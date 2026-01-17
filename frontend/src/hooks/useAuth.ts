import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/stores/authStore';
import type { AuthProvider } from '@policy-flow/contracts';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (provider: AuthProvider, token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, token }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const result = await response.json();
      setAuth(result.data);
      router.push('/');
    } catch (err) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = useAuthStore.getState().accessToken;

      await fetch('/api/v1/auth/logout', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      clearAuth();
      router.push('/auth/login');
    } catch (err) {
      setError('로그아웃에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
}
