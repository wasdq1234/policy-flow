'use client';

import Link from 'next/link';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            커뮤니티
          </h1>
          <Link
            href="/community/write"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            글쓰기
          </Link>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-500 text-center py-12">
            게시글이 없습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
