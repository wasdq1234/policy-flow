'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/stores/authStore';
import { useBookmarks } from '@/src/hooks/useBookmarks';
import { PolicyDetailModal } from '@/src/components/policy/PolicyDetailModal';
import { CATEGORY_LABELS, REGION_LABELS, STATUS_LABELS } from '@/src/constants/labels';

export default function BookmarksPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { bookmarks, isLoading, error, deleteBookmark } = useBookmarks();
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">에러가 발생했습니다: {error.message}</div>
      </div>
    );
  }

  const handleDelete = async (policyId: string) => {
    if (!confirm('북마크를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteBookmark(policyId);
    } catch (err) {
      alert('북마크 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">북마크한 정책</h1>

        {bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">북마크한 정책이 없습니다.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              정책 둘러보기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.policyId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPolicyId(bookmark.policyId)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {bookmark.policy.title}
                    </h2>
                    {bookmark.policy.summary && (
                      <p className="text-gray-600 mb-4">{bookmark.policy.summary}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                        {STATUS_LABELS[bookmark.policy.status]}
                      </span>
                      <span>{CATEGORY_LABELS[bookmark.policy.category]}</span>
                      <span>{REGION_LABELS[bookmark.policy.region]}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(bookmark.policyId);
                    }}
                    className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedPolicyId && (
          <PolicyDetailModal
            policyId={selectedPolicyId}
            onClose={() => setSelectedPolicyId(null)}
          />
        )}
      </div>
    </div>
  );
}
