'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/stores/authStore';
import { useNotificationStore } from '@/src/stores/notificationStore';
import { usePushNotification } from '@/src/hooks/usePushNotification';
import PushPermissionModal from '@/src/components/notification/PushPermissionModal';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    isEnabled,
    isPermissionGranted,
    setEnabled,
  } = useNotificationStore();
  const {
    isSupported,
    requestPermission,
    registerToken,
  } = usePushNotification();

  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleToggleNotification = async () => {
    if (!isEnabled) {
      // 알림을 켜려고 할 때
      if (!isPermissionGranted) {
        // 권한이 없으면 모달 표시
        setShowPermissionModal(true);
      } else {
        // 권한이 있으면 바로 활성화
        setEnabled(true);
        await registerToken();
      }
    } else {
      // 알림을 끄려고 할 때
      setEnabled(false);
    }
  };

  const handleAllowPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      setEnabled(true);
      await registerToken();
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">설정</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* 알림 설정 섹션 */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              알림 설정
            </h2>

            {/* 브라우저 지원 여부 */}
            {!isSupported && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  현재 브라우저는 푸시 알림을 지원하지 않습니다.
                </p>
              </div>
            )}

            {/* 알림 토글 */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">
                  푸시 알림
                </h3>
                <p className="text-sm text-gray-500">
                  마감 임박 정책 알림을 받을 수 있습니다
                </p>
                {isEnabled && (
                  <p className="text-xs text-green-600 mt-1">
                    알림이 활성화되었습니다
                  </p>
                )}
                {!isPermissionGranted && !isEnabled && (
                  <p className="text-xs text-gray-500 mt-1">
                    알림을 받으려면 권한을 허용해주세요
                  </p>
                )}
              </div>

              {/* Toggle Switch */}
              <button
                onClick={handleToggleNotification}
                disabled={!isSupported}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isEnabled ? 'bg-blue-600' : 'bg-gray-200'}
                  ${!isSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                aria-label="알림 토글"
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* 추가 설정 섹션 (향후 확장) */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              계정 설정
            </h2>
            <p className="text-sm text-gray-500">
              추가 설정 기능이 곧 제공됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 권한 요청 모달 */}
      <PushPermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onAllow={handleAllowPermission}
      />
    </div>
  );
}
