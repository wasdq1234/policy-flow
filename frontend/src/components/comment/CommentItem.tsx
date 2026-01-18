import type { CommentItem as CommentType } from '@policy-flow/contracts';

interface CommentItemProps {
  comment: CommentType;
  onReply: (commentId: number) => void;
  onDelete: (commentId: number) => void;
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return new Date(timestamp).toLocaleDateString('ko-KR');
}

export function CommentItem({ comment, onReply, onDelete }: CommentItemProps) {
  const handleDelete = () => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      onDelete(comment.id);
    }
  };

  const displayNickname = comment.nickname || '익명';
  const isReply = comment.parentId !== null;

  return (
    <div className={`py-4 border-b border-gray-200 ${isReply ? 'pl-8' : ''}`}>
      {/* Header: Profile + Nickname + Time */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm text-gray-600">
          {displayNickname.charAt(0)}
        </div>
        <span className="font-medium text-gray-900">{displayNickname}</span>
        <span className="text-sm text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
      </div>

      {/* Content */}
      <p className="text-gray-800 mb-3 ml-10">{comment.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-3 ml-10">
        <button
          onClick={() => onReply(comment.id)}
          className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          답글
        </button>

        {comment.isAuthor && (
          <>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleDelete}
              className="text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              삭제
            </button>
          </>
        )}
      </div>
    </div>
  );
}
