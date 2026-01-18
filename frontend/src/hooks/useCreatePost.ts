import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { CreatePostRequest, CreatePostResponse } from '@policy-flow/contracts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export interface CreatePostData {
  type: 'TIP' | 'QUESTION' | 'REVIEW';
  title: string;
  content: string;
  authorNickname?: string;
  policyId?: string;
}

export function useCreatePost() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  const createPost = async (data: CreatePostData): Promise<CreatePostResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody: CreatePostRequest = {
        type: data.type,
        title: data.title,
        content: data.content,
        authorNickname: data.authorNickname,
        policyId: data.policyId,
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '게시글 작성에 실패했습니다.');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '게시글 작성에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPost,
    isLoading,
    error,
  };
}
