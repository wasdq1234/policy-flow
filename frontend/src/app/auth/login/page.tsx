'use client';

import { useAuth } from '@/src/hooks/useAuth';
import { SocialLoginButton } from '@/src/components/auth/SocialLoginButton';
import type { AuthProvider } from '@policy-flow/contracts';

export default function LoginPage() {
  const { isLoading, error, login } = useAuth();

  const handleSocialLogin = async (provider: AuthProvider) => {
    // In a real app, this would open OAuth flow and get the token
    // For now, we'll use a mock token for testing
    const mockToken = 'valid-token';
    await login(provider, mockToken);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PolicyFlow KR</h1>
          <p className="text-gray-600">
            청년을 위한 정책 정보를 쉽고 빠르게
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <SocialLoginButton
            provider="google"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
          />
          <SocialLoginButton
            provider="kakao"
            onClick={() => handleSocialLogin('kakao')}
            disabled={isLoading}
          />
        </div>

        {/* Terms */}
        <p className="mt-6 text-xs text-center text-gray-500">
          계속 진행하면{' '}
          <a href="#" className="text-blue-600 hover:underline">
            서비스 약관
          </a>
          과{' '}
          <a href="#" className="text-blue-600 hover:underline">
            개인정보 처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
