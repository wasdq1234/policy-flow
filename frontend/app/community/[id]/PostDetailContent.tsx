'use client';

import { useRouter } from 'next/navigation';
import { usePost } from '@/src/hooks/usePost';
import { PostTypeTag } from '@/src/components/post/PostTypeTag';

interface PostDetailContentProps {
  id: string;
}

export function PostDetailContent({ id }: PostDetailContentProps) {
  const router = useRouter();
  const { post, isLoading, error, toggleLike, isLiking } = usePost(id);

  const handleBackClick = () => {
    router.push('/community');
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8 pb-24 md:pb-8">
        <div className="max-w-4xl w-full">
          <div className="text-center py-12">
            <p className="text-gray-500">게시글을 불러오는 중...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8 pb-24 md:pb-8">
        <div className="max-w-4xl w-full">
          <div className="text-center py-12">
            <p className="text-red-500">게시글을 찾을 수 없습니다.</p>
            <p className="text-sm text-gray-500 mt-2">{error?.message}</p>
            <button
              onClick={handleBackClick}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              목록으로
            </button>
          </div>
        </div>
      </main>
    );
  }

  const displayNickname = post.nickname || `익명#${post.id.toString().slice(-4)}`;
  const createdDate = new Date(post.createdAt * 1000).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-8 pb-24 md:pb-8">
      <div className="max-w-4xl w-full">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="mb-6 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <span>←</span>
          <span>목록으로</span>
        </button>

        {/* Post Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 shadow-sm">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <PostTypeTag type={post.postType} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{displayNickname}</span>
              <span className="text-gray-300">|</span>
              <span>{createdDate}</span>
              <span className="text-gray-300">|</span>
              <span>조회 {post.viewCount}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6" />

          {/* Content */}
          <div className="prose max-w-none mb-8">
            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6" />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={toggleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                post.isLikedByMe
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={post.isLikedByMe ? '좋아요 취소' : '좋아요'}
            >
              <span>{post.isLikedByMe ? '❤️' : '🤍'}</span>
              <span>좋아요</span>
              <span className="font-bold">{post.likeCount}</span>
            </button>

            <button
              onClick={handleBackClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              목록으로
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
