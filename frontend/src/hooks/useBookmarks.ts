import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { useBookmarkStore } from '@/src/stores/bookmarkStore';
import type { CreateBookmarkRequest } from '@policy-flow/contracts';

const API_BASE_URL = '/api/v1';

export function useBookmarks() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const {
    bookmarks,
    isLoading,
    error,
    setBookmarks,
    removeBookmark,
    isBookmarked,
    setLoading,
    setError,
  } = useBookmarkStore();

  // 북마크 목록 조회
  const fetchBookmarks = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/bookmarks`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }

      const data = await response.json();
      setBookmarks(data.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, accessToken, setBookmarks, setLoading, setError]);

  // 북마크 추가
  const createBookmark = useCallback(
    async (policyId: string, notifyBeforeDays?: number) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('로그인이 필요합니다.');
      }

      setLoading(true);
      setError(null);

      try {
        const requestBody: CreateBookmarkRequest = {
          policyId,
          notifyBeforeDays,
        };

        const response = await fetch(`${API_BASE_URL}/bookmarks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error('Failed to create bookmark');
        }

        const data = await response.json();

        // 전체 북마크 정보를 다시 조회 (정책 정보 포함)
        await fetchBookmarks();

        return data.data;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, accessToken, fetchBookmarks, setLoading, setError]
  );

  // 북마크 삭제
  const deleteBookmark = useCallback(
    async (policyId: string) => {
      if (!isAuthenticated || !accessToken) {
        throw new Error('로그인이 필요합니다.');
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/bookmarks/${policyId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete bookmark');
        }

        removeBookmark(policyId);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, accessToken, removeBookmark, setLoading, setError]
  );

  // 북마크 토글
  const toggleBookmark = useCallback(
    async (policyId: string) => {
      if (isBookmarked(policyId)) {
        await deleteBookmark(policyId);
      } else {
        await createBookmark(policyId);
      }
    },
    [isBookmarked, createBookmark, deleteBookmark]
  );

  // 초기 로드
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookmarks();
    }
  }, [isAuthenticated, fetchBookmarks]);

  return {
    bookmarks,
    isLoading,
    error,
    isBookmarked,
    createBookmark,
    deleteBookmark,
    toggleBookmark,
    refetch: fetchBookmarks,
  };
}
