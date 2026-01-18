import { useState, useEffect, useCallback } from 'react';
import type { PostListItem, GetPostsQuery } from '@policy-flow/contracts';
import type { PaginationMeta } from '@policy-flow/contracts';

interface UsePostsResult {
  posts: PostListItem[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePosts(query?: GetPostsQuery): UsePostsResult {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query string
      const params = new URLSearchParams();
      if (query?.page) params.append('page', query.page.toString());
      if (query?.limit) params.append('limit', query.limit.toString());
      if (query?.policyId) params.append('policyId', query.policyId);
      if (query?.type) params.append('type', query.type);

      const url = `/api/v1/posts${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data = await response.json();
      setPosts(data.data || []);
      setMeta(data.meta || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setPosts([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [query?.page, query?.limit, query?.policyId, query?.type]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    meta,
    isLoading,
    error,
    refetch: fetchPosts,
  };
}
