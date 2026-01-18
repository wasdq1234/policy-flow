import { useState, useEffect } from 'react';
import type { CommentItem } from '@policy-flow/contracts';
import { useAuthStore } from '@/src/stores/authStore';

interface UseCommentsOptions {
  postId: string;
  enabled?: boolean;
}

interface UseCommentsReturn {
  comments: CommentItem[];
  isLoading: boolean;
  error: string | null;
  createComment: (content: string, nickname?: string, parentId?: number) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useComments({ postId, enabled = true }: UseCommentsOptions): UseCommentsReturn {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuthStore();

  const fetchComments = async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `http://localhost:3001/api/v1/posts/${postId}/comments`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('댓글을 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setComments(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const createComment = async (content: string, nickname?: string, parentId?: number) => {
    if (!content.trim()) {
      throw new Error('댓글 내용을 입력해주세요');
    }

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `http://localhost:3001/api/v1/posts/${postId}/comments`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            content: content.trim(),
            nickname: nickname?.trim() || undefined,
            parentId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('댓글 작성에 실패했습니다');
      }

      await fetchComments();
    } catch (err) {
      throw err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다');
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`http://localhost:3001/api/v1/comments/${commentId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('댓글 삭제에 실패했습니다');
      }

      await fetchComments();
    } catch (err) {
      throw err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다');
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, enabled]);

  return {
    comments,
    isLoading,
    error,
    createComment,
    deleteComment,
    refetch: fetchComments,
  };
}
