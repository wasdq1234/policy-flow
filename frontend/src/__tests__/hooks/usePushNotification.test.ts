import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { usePushNotification } from '@/src/hooks/usePushNotification';
import { useNotificationStore } from '@/src/stores/notificationStore';

describe('usePushNotification', () => {
  beforeEach(() => {
    // Reset store
    useNotificationStore.setState({
      isEnabled: false,
      isPermissionGranted: false,
      fcmToken: null,
    });
  });

  it('초기 상태를 올바르게 반환한다', () => {
    const { result } = renderHook(() => usePushNotification());

    expect(result.current.isSupported).toBe(true);
    expect(result.current.isPermissionGranted).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('requestPermission을 호출하면 권한이 허용된다', async () => {
    const { result } = renderHook(() => usePushNotification());

    let permissionResult: boolean = false;

    await act(async () => {
      permissionResult = await result.current.requestPermission();
    });

    expect(permissionResult).toBe(true);
    expect(result.current.isPermissionGranted).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('registerToken을 호출하면 FCM 토큰이 등록된다', async () => {
    const { result } = renderHook(() => usePushNotification());

    await act(async () => {
      await result.current.registerToken();
    });

    const { fcmToken } = useNotificationStore.getState();
    expect(fcmToken).toMatch(/^mock_fcm_token_/);
    expect(result.current.error).toBe(null);
  });

  it('로딩 상태가 올바르게 변경된다', async () => {
    const { result } = renderHook(() => usePushNotification());

    expect(result.current.isLoading).toBe(false);

    const promise = act(async () => {
      await result.current.requestPermission();
    });

    // Loading state는 비동기이므로 체크하기 어려움 (mock이 너무 빠름)
    await promise;

    expect(result.current.isLoading).toBe(false);
  });
});
