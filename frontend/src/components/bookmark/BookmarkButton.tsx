'use client';

import { useAuthStore } from '@/src/stores/authStore';
import { useBookmarkStore } from '@/src/stores/bookmarkStore';

interface BookmarkButtonProps {
  policyId: string;
  onToggle: (policyId: string) => void;
}

export function BookmarkButton({ policyId, onToggle }: BookmarkButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const { isBookmarked, isLoading } = useBookmarkStore();

  const bookmarked = isBookmarked(policyId);

  const handleClick = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    onToggle(policyId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`px-6 py-3 border font-medium rounded-lg transition-colors ${
        bookmarked
          ? 'border-red-500 text-red-500 hover:bg-red-50'
          : 'border-gray-300 text-gray-400 hover:bg-gray-50'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={bookmarked ? '북마크됨' : '북마크'}
    >
      <span className="flex items-center gap-2">
        <svg
          className="w-5 h-5"
          fill={bookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {bookmarked ? '북마크됨' : '북마크'}
      </span>
    </button>
  );
}
