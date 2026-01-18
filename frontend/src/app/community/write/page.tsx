'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PostForm } from '@/src/components/post/PostForm';
import { useCreatePost, type CreatePostData } from '@/src/hooks/useCreatePost';
import { useAuthStore } from '@/src/stores/authStore';

export default function WritePage() {
  const router = useRouter();
  const { createPost, isLoading } = useCreatePost();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (data: CreatePostData) => {
    try {
      const result = await createPost(data);
      // 작성 성공 시 상세 페이지로 이동
      router.push(`/community/${result.id}`);
    } catch (error) {
      console.error('Failed to create post:', error);
      // 에러 처리는 useCreatePost 훅에서 처리됨
    }
  };

  const handleCancel = () => {
    router.push('/community');
  };

  if (!isAuthenticated) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          게시글 작성
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <PostForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            defaultNickname={user?.nickname}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
