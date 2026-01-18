import { useState, useEffect, useCallback } from 'react';
import type { PostDetail, LikePostResponse } from '@policy-flow/contracts';

interface UsePostResult {
  post: PostDetail | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  toggleLike: () => Promise<void>;
  isLiking: boolean;
}

export function usePost(id: string): UsePostResult {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLiking, setIsLiking] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/posts/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Post not found');
        }
        throw new Error(`Failed to fetch post: ${response.statusText}`);
      }

      const data = await response.json();
      setPost(data.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setPost(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const toggleLike = useCallback(async () => {
    if (!post || isLiking) return;

    try {
      setIsLiking(true);

      const response = await fetch(`/api/v1/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-token',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      const likeData = data.data as LikePostResponse;

      // Update post with new like data
      setPost({
        ...post,
        likeCount: likeData.likeCount,
        isLikedByMe: likeData.liked,
      });
    } catch (err) {
      console.error('Like error:', err);
    } finally {
      setIsLiking(false);
    }
  }, [id, post, isLiking]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return {
    post,
    isLoading,
    error,
    refetch: fetchPost,
    toggleLike,
    isLiking,
  };
}
