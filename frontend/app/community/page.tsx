'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePosts } from '@/src/hooks/usePosts';
import { PostCard } from '@/src/components/post/PostCard';
import type { PostType } from '@policy-flow/contracts';

const POST_TYPE_FILTERS: { label: string; value: PostType | null }[] = [
  { label: '전체', value: null },
  { label: '꿀팁', value: 'TIP' },
  { label: '질문', value: 'QUESTION' },
  { label: '후기', value: 'REVIEW' },
  { label: '일반', value: 'GENERAL' },
];

export default function CommunityPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<PostType | null>(null);

  const { posts, isLoading, error } = usePosts({
    type: selectedType || undefined,
    page: 1,
    limit: 20,
  });

  const handlePostClick = (postId: number) => {
    router.push(`/community/${postId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 pb-24 md:pb-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <h1 className="text-h1 font-bold text-gray-900 mb-6">커뮤니티 게시판</h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {POST_TYPE_FILTERS.map((filter) => (
            <button
              key={filter.label}
              onClick={() => setSelectedType(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                selectedType === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">게시글을 불러오는 중...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">게시글을 불러오는데 실패했습니다.</p>
            <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-500">게시글이 없습니다.</p>
            <p className="text-sm text-gray-400 mt-2">
              첫 번째 게시글을 작성해보세요!
            </p>
          </div>
        )}

        {/* Posts List */}
        {!isLoading && !error && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => handlePostClick(post.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
