import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsPage from '@/src/app/mypage/settings/page';
import { useAuthStore } from '@/src/stores/authStore';
import { useNotificationStore } from '@/src/stores/notificationStore';
import { usePushNotification } from '@/src/hooks/usePushNotification';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock hooks
vi.mock('@/src/hooks/usePushNotification');

describe('SettingsPage', () => {
  const mockRequestPermission = vi.fn();
  const mockRegisterToken = vi.fn();

  beforeEach(() => {
    // Reset stores
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', email: 'test@example.com', nickname: 'Test User' },
      accessToken: 'token',
      refreshToken: 'refresh',
    });

    useNotificationStore.setState({
      isEnabled: false,
      isPermissionGranted: false,
      fcmToken: null,
    });

    // Mock usePushNotification
    vi.mocked(usePushNotification).mockReturnValue({
      isSupported: true,
      isPermissionGranted: false,
      isLoading: false,
      error: null,
      requestPermission: mockRequestPermission,
      registerToken: mockRegisterToken,
    });

    mockRequestPermission.mockResolvedValue(true);
    mockRegisterToken.mockResolvedValue(undefined);
  });

  it('설정 페이지가 렌더링된다', () => {
    render(<SettingsPage />);

    expect(screen.getByText('설정')).toBeInTheDocument();
    expect(screen.getByText('알림 설정')).toBeInTheDocument();
    expect(screen.getByText('푸시 알림')).toBeInTheDocument();
    expect(screen.getByText('마감 임박 정책 알림을 받을 수 있습니다')).toBeInTheDocument();
  });

  it('알림 토글 스위치가 렌더링된다', () => {
    render(<SettingsPage />);

    const toggle = screen.getByLabelText('알림 토글');
    expect(toggle).toBeInTheDocument();
  });

  it('권한이 없을 때 토글 클릭 시 권한 요청 모달이 표시된다', async () => {
    render(<SettingsPage />);

    const toggle = screen.getByLabelText('알림 토글');
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(screen.getByText('알림을 받으시겠습니까?')).toBeInTheDocument();
    });
  });

  it('권한이 있을 때 토글 클릭 시 바로 알림이 활성화된다', async () => {
    useNotificationStore.setState({
      isEnabled: false,
      isPermissionGranted: true,
      fcmToken: null,
    });

    vi.mocked(usePushNotification).mockReturnValue({
      isSupported: true,
      isPermissionGranted: true,
      isLoading: false,
      error: null,
      requestPermission: mockRequestPermission,
      registerToken: mockRegisterToken,
    });

    render(<SettingsPage />);

    const toggle = screen.getByLabelText('알림 토글');
    fireEvent.click(toggle);

    await waitFor(() => {
      const state = useNotificationStore.getState();
      expect(state.isEnabled).toBe(true);
    });

    expect(mockRegisterToken).toHaveBeenCalled();
  });

  it('알림이 활성화된 상태에서 토글 클릭 시 비활성화된다', async () => {
    useNotificationStore.setState({
      isEnabled: true,
      isPermissionGranted: true,
      fcmToken: 'mock_token',
    });

    render(<SettingsPage />);

    const toggle = screen.getByLabelText('알림 토글');
    fireEvent.click(toggle);

    await waitFor(() => {
      const state = useNotificationStore.getState();
      expect(state.isEnabled).toBe(false);
    });
  });

  it('모달에서 알림 허용 버튼 클릭 시 권한을 요청하고 알림이 활성화된다', async () => {
    render(<SettingsPage />);

    // 토글 클릭하여 모달 열기
    const toggle = screen.getByLabelText('알림 토글');
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(screen.getByText('알림 허용')).toBeInTheDocument();
    });

    // 알림 허용 버튼 클릭
    const allowButton = screen.getByText('알림 허용');
    fireEvent.click(allowButton);

    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalled();
      expect(mockRegisterToken).toHaveBeenCalled();
    });
  });

  it('모달에서 나중에 버튼 클릭 시 모달이 닫힌다', async () => {
    render(<SettingsPage />);

    // 토글 클릭하여 모달 열기
    const toggle = screen.getByLabelText('알림 토글');
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(screen.getByText('나중에')).toBeInTheDocument();
    });

    // 나중에 버튼 클릭
    const laterButton = screen.getByText('나중에');
    fireEvent.click(laterButton);

    await waitFor(() => {
      expect(screen.queryByText('알림을 받으시겠습니까?')).not.toBeInTheDocument();
    });
  });

  it('브라우저가 지원하지 않을 때 경고 메시지를 표시한다', () => {
    vi.mocked(usePushNotification).mockReturnValue({
      isSupported: false,
      isPermissionGranted: false,
      isLoading: false,
      error: null,
      requestPermission: mockRequestPermission,
      registerToken: mockRegisterToken,
    });

    render(<SettingsPage />);

    expect(
      screen.getByText('현재 브라우저는 푸시 알림을 지원하지 않습니다.')
    ).toBeInTheDocument();
  });

  it('알림이 활성화된 상태를 표시한다', () => {
    useNotificationStore.setState({
      isEnabled: true,
      isPermissionGranted: true,
      fcmToken: 'mock_token',
    });

    render(<SettingsPage />);

    expect(screen.getByText('알림이 활성화되었습니다')).toBeInTheDocument();
  });
});
