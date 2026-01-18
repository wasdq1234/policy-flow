import type { PostListItem } from '@policy-flow/contracts';
import { PostTypeTag } from './PostTypeTag';

interface PostCardProps {
  post: PostListItem;
  onClick?: () => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
  const displayNickname = post.nickname || `익명#${post.id.toString().slice(-4)}`;

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header: Type Tag + Title */}
      <div className="flex items-start gap-2 mb-2">
        <PostTypeTag type={post.postType} />
        <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-1">
          {post.title}
        </h3>
      </div>

      {/* Content Preview */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.content}</p>

      {/* Footer: Metadata */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{displayNickname}</span>
        <span className="text-gray-300">|</span>
        <span className="flex items-center gap-1">
          <span>❤️</span>
          <span>{post.likeCount}</span>
        </span>
        <span className="flex items-center gap-1">
          <span>💬</span>
          <span>{post.commentCount}</span>
        </span>
        <span className="flex items-center gap-1">
          <span>👁️</span>
          <span>{post.viewCount}</span>
        </span>
      </div>
    </div>
  );
}
