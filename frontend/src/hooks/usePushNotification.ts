import { useState, useCallback } from 'react';
import { useNotificationStore } from '@/src/stores/notificationStore';

interface UsePushNotificationReturn {
  isSupported: boolean;
  isPermissionGranted: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  registerToken: () => Promise<void>;
}

export function usePushNotification(): UsePushNotificationReturn {
  const { isPermissionGranted, setPermissionGranted, setFcmToken } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock: 항상 지원됨
  const isSupported = true;

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock implementation: 항상 성공
      await new Promise((resolve) => setTimeout(resolve, 300));

      setPermissionGranted(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      setError('권한 요청에 실패했습니다.');
      setIsLoading(false);
      return false;
    }
  }, [setPermissionGranted]);

  const registerToken = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock implementation: FCM 토큰 발급 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockToken = `mock_fcm_token_${Date.now()}`;
      setFcmToken(mockToken);
      setIsLoading(false);
    } catch (err) {
      setError('토큰 등록에 실패했습니다.');
      setIsLoading(false);
    }
  }, [setFcmToken]);

  return {
    isSupported,
    isPermissionGranted,
    isLoading,
    error,
    requestPermission,
    registerToken,
  };
}
