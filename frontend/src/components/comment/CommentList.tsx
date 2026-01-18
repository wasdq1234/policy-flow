import { useState } from 'react';
import { useComments } from '@/src/hooks/useComments';
import { useAuthStore } from '@/src/stores/authStore';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';

interface CommentListProps {
  postId: string;
}

export function CommentList({ postId }: CommentListProps) {
  const { comments, isLoading, error, createComment, deleteComment } = useComments({ postId });
  const { isAuthenticated } = useAuthStore();
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const handleCommentSubmit = async (data: { content: string; nickname?: string }) => {
    try {
      await createComment(data.content, data.nickname);
    } catch (err) {
      alert(err instanceof Error ? err.message : '댓글 작성에 실패했습니다');
    }
  };

  const handleReplySubmit = async (
    data: { content: string; nickname?: string },
    parentId: number
  ) => {
    try {
      await createComment(data.content, data.nickname, parentId);
      setReplyingTo(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : '답글 작성에 실패했습니다');
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await deleteComment(commentId);
    } catch (err) {
      alert(err instanceof Error ? err.message : '댓글 삭제에 실패했습니다');
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>댓글을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Comment Count */}
      <h3 className="text-lg font-bold text-gray-900 mb-4">댓글 {comments.length}</h3>

      {/* Comment Form */}
      {isAuthenticated ? (
        <div className="mb-6">
          <CommentForm onSubmit={handleCommentSubmit} showNickname />
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
          <p>댓글을 작성하려면 로그인이 필요합니다</p>
        </div>
      )}

      {/* Comment List */}
      {comments.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>아직 댓글이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-0">
          {comments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                onReply={(commentId) => setReplyingTo(commentId)}
                onDelete={handleDelete}
              />

              {/* Reply Form */}
              {replyingTo === comment.id && isAuthenticated && (
                <div className="ml-10 mt-3 mb-4">
                  <CommentForm
                    onSubmit={(data) => handleReplySubmit(data, comment.id)}
                    placeholder="답글을 입력하세요"
                    buttonText="등록"
                    showNickname
                  />
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="mt-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    취소
                  </button>
                </div>
              )}

              {/* Replies */}
              {comment.replies &&
                comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onReply={(replyId) => setReplyingTo(replyId)}
                    onDelete={handleDelete}
                  />
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
