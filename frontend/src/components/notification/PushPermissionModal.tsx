'use client';

import { useState } from 'react';

interface PushPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => Promise<void>;
}

export default function PushPermissionModal({
  isOpen,
  onClose,
  onAllow,
}: PushPermissionModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAllow = async () => {
    setIsLoading(true);
    try {
      await onAllow();
      onClose();
    } catch (error) {
      console.error('Failed to allow push notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🔔</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          알림을 받으시겠습니까?
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          마감 임박 정책 알림을 받을 수 있습니다
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            나중에
          </button>
          <button
            onClick={handleAllow}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : '알림 허용'}
          </button>
        </div>
      </div>
    </div>
  );
}
