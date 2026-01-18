'use client';

import { useState } from 'react';
import type { CreatePostData } from '../../hooks/useCreatePost';

export interface PostFormProps {
  onSubmit: (data: CreatePostData) => Promise<void>;
  isLoading: boolean;
  defaultNickname?: string;
  onCancel?: () => void;
}

type PostType = 'TIP' | 'QUESTION' | 'REVIEW';

const POST_TYPE_CONFIG = {
  TIP: {
    label: '꿀팁',
    activeClass: 'bg-blue-500 text-white',
    inactiveClass: 'bg-gray-100 text-gray-700',
  },
  QUESTION: {
    label: '질문',
    activeClass: 'bg-orange-500 text-white',
    inactiveClass: 'bg-gray-100 text-gray-700',
  },
  REVIEW: {
    label: '후기',
    activeClass: 'bg-green-500 text-white',
    inactiveClass: 'bg-gray-100 text-gray-700',
  },
} as const;

export function PostForm({ onSubmit, isLoading, defaultNickname = '익명', onCancel }: PostFormProps) {
  const [type, setType] = useState<PostType>('TIP');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorNickname, setAuthorNickname] = useState(defaultNickname);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors
    setErrors({});

    // Submit
    await onSubmit({
      type,
      title: title.trim(),
      content: content.trim(),
      authorNickname: authorNickname.trim() || '익명',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 유형 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          유형
        </label>
        <div className="flex gap-2">
          {(Object.keys(POST_TYPE_CONFIG) as PostType[]).map((postType) => {
            const config = POST_TYPE_CONFIG[postType];
            const isActive = type === postType;
            return (
              <button
                key={postType}
                type="button"
                onClick={() => setType(postType)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive ? config.activeClass : config.inactiveClass
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 닉네임 */}
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
          닉네임
        </label>
        <input
          type="text"
          id="nickname"
          value={authorNickname}
          onChange={(e) => setAuthorNickname(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="닉네임을 입력하세요 (선택)"
          maxLength={20}
        />
      </div>

      {/* 제목 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          제목
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="제목을 입력하세요"
          maxLength={100}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      {/* 내용 */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          내용
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="내용을 입력하세요"
          maxLength={5000}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-500">{errors.content}</p>
        )}
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '작성 중...' : '작성하기'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
