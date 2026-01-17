import type { AuthProvider } from '@policy-flow/contracts';

interface SocialLoginButtonProps {
  provider: AuthProvider;
  onClick: () => void;
  disabled?: boolean;
}

export function SocialLoginButton({ provider, onClick, disabled = false }: SocialLoginButtonProps) {
  const providerConfig = {
    google: {
      label: 'Google로 계속하기',
      bgColor: 'bg-white',
      textColor: 'text-gray-900',
      borderColor: 'border-gray-300',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
    },
    kakao: {
      label: 'Kakao로 계속하기',
      bgColor: 'bg-[#FEE500]',
      textColor: 'text-gray-900',
      borderColor: 'border-[#FEE500]',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#000000"
            d="M12 3C6.48 3 2 6.58 2 11c0 2.89 1.97 5.42 4.88 6.86-.2.73-.74 2.67-.85 3.1-.13.52.19.51.4.37.17-.11 2.54-1.73 3.51-2.39.68.09 1.38.14 2.06.14 5.52 0 10-3.58 10-8S17.52 3 12 3z"
          />
        </svg>
      ),
    },
  };

  const config = providerConfig[provider];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg
        border ${config.borderColor} ${config.bgColor} ${config.textColor}
        font-medium text-base
        transition-all duration-200
        hover:shadow-md
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
      `}
    >
      {config.icon}
      <span>{config.label}</span>
    </button>
  );
}
