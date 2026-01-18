'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/stores/authStore';
import { PostTypeTag } from '@/src/components/post/PostTypeTag';
import { CommentList } from '@/src/components/comment/CommentList';
import type { PostDetail } from '@policy-flow/contracts';

// Static Export를 위한 generateStaticParams
export async function generateStaticParams() {
  // 개발 환경에서는 빈 배열 반환 (동적으로 처리)
  return [];
}

// 동적 라우트 파라미터 허용
export const dynamicParams = true;

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`http://localhost:3001/api/v1/posts/${params.id}`, {
          headers,
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('게시글을 찾을 수 없습니다');
          }
          throw new Error('게시글을 불러오는데 실패했습니다');
        }

        const data = await response.json();
        setPost(data.data);
        setLikeCount(data.data.likeCount);
        setIsLiked(data.data.isLikedByMe || false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [params.id, accessToken]);

  const handleLike = async () => {
    if (!accessToken) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/v1/posts/${params.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('좋아요 처리에 실패했습니다');
      }

      const data = await response.json();
      setLikeCount(data.data.likeCount);
      setIsLiked(data.data.liked);
    } catch (err) {
      alert(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    }
  };

  const handleBackToList = () => {
    router.push('/community');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const displayNickname = post.nickname || `익명#${post.id.toString().slice(-4)}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={handleBackToList}
          className="mb-4 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          ← 목록으로
        </button>

        {/* Post Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <PostTypeTag type={post.postType} />
              <h1 className="text-2xl font-bold text-gray-900 flex-1">{post.title}</h1>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>{displayNickname}</span>
              <span className="text-gray-300">|</span>
              <span>조회 {post.viewCount}</span>
              <span className="text-gray-300">|</span>
              <span>{new Date(post.createdAt * 1000).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>❤️</span>
              <span>좋아요</span>
              <span className="font-medium">{likeCount}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <CommentList postId={params.id} />
        </div>

        {/* Bottom Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleBackToList}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            목록으로
          </button>
        </div>
      </div>
    </div>
  );
}
