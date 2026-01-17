/**
 * 댓글 서비스
 * 댓글 목록 조회, 생성, 삭제, 좋아요
 */
import type { D1Database } from '@cloudflare/workers-types';

export interface CommentItem {
  id: number;
  content: string;
  nickname: string | null;
  parentId: number | null;
  likeCount: number;
  isLikedByMe?: boolean;
  isAuthor?: boolean;
  createdAt: number;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: number;
  nickname?: string;
}

export interface CreateCommentResponse {
  id: number;
  content: string;
  nickname: string | null;
  parentId: number | null;
  createdAt: number;
}

export interface LikeCommentResponse {
  liked: boolean;
  likeCount: number;
}

/**
 * 댓글 목록 조회 (특정 게시글의 댓글)
 */
export async function getCommentsByPostId(
  db: D1Database,
  postId: number,
  userId?: string,
  page: number = 1,
  limit: number = 50
): Promise<{ data: CommentItem[]; total: number }> {
  // 게시글 존재 확인
  const postQuery = `
    SELECT id, is_deleted FROM posts
    WHERE id = ?
    LIMIT 1
  `;
  const post = await db.prepare(postQuery).bind(postId).first<any>();

  if (!post || post.is_deleted) {
    throw new Error('NOT_FOUND');
  }

  // 전체 댓글 수 조회
  const countQuery = `
    SELECT COUNT(*) as count FROM comments
    WHERE post_id = ? AND is_deleted = 0
  `;
  const countResult = await db.prepare(countQuery).bind(postId).first<{ count: number }>();
  const total = countResult?.count || 0;

  // 페이지네이션 계산
  const offset = (page - 1) * limit;

  // 댓글 조회 (부모 댓글만 조회, 대댓글은 별도로)
  const commentsQuery = `
    SELECT
      id, content, nickname, parent_id, like_count, created_at, user_id
    FROM comments
    WHERE post_id = ? AND is_deleted = 0
    ORDER BY created_at ASC
    LIMIT ? OFFSET ?
  `;

  const commentsResult = await db
    .prepare(commentsQuery)
    .bind(postId, limit, offset)
    .all<any>();

  const comments = commentsResult.results || [];

  // 좋아요 여부 확인 (userId가 있는 경우)
  const data: CommentItem[] = [];

  for (const comment of comments) {
    let isLikedByMe = false;
    if (userId) {
      const likeQuery = `
        SELECT 1 FROM comment_likes
        WHERE user_id = ? AND comment_id = ?
        LIMIT 1
      `;
      const likeResult = await db.prepare(likeQuery).bind(userId, comment.id).first();
      isLikedByMe = !!likeResult;
    }

    const isAuthor = userId ? comment.user_id === userId : false;

    data.push({
      id: comment.id,
      content: comment.content,
      nickname: comment.nickname || null,
      parentId: comment.parent_id || null,
      likeCount: comment.like_count || 0,
      isLikedByMe,
      isAuthor,
      createdAt: comment.created_at,
    });
  }

  return { data, total };
}

/**
 * 댓글 생성
 */
export async function createComment(
  db: D1Database,
  postId: number,
  userId: string,
  request: CreateCommentRequest
): Promise<CreateCommentResponse> {
  // 게시글 존재 확인
  const postQuery = `
    SELECT id, is_deleted FROM posts
    WHERE id = ?
    LIMIT 1
  `;
  const post = await db.prepare(postQuery).bind(postId).first<any>();

  if (!post || post.is_deleted) {
    throw new Error('NOT_FOUND');
  }

  // parentId가 있는 경우 부모 댓글 존재 확인
  if (request.parentId) {
    const parentQuery = `
      SELECT id, is_deleted FROM comments
      WHERE id = ? AND post_id = ?
      LIMIT 1
    `;
    const parent = await db
      .prepare(parentQuery)
      .bind(request.parentId, postId)
      .first<any>();

    if (!parent || parent.is_deleted) {
      throw new Error('PARENT_NOT_FOUND');
    }
  }

  const now = Math.floor(Date.now() / 1000);

  const insertQuery = `
    INSERT INTO comments (
      post_id, parent_id, user_id, nickname, content,
      like_count, is_deleted, created_at
    ) VALUES (?, ?, ?, ?, ?, 0, 0, ?)
  `;

  await db
    .prepare(insertQuery)
    .bind(
      postId,
      request.parentId || null,
      userId,
      request.nickname || null,
      request.content,
      now
    )
    .run();

  // 생성된 댓글 조회 (가장 최근 댓글)
  const selectQuery = `
    SELECT id, content, nickname, parent_id, created_at
    FROM comments
    WHERE user_id = ? AND created_at = ?
    ORDER BY id DESC
    LIMIT 1
  `;

  const comment = await db.prepare(selectQuery).bind(userId, now).first<any>();

  if (!comment) {
    throw new Error('댓글 생성에 실패했습니다.');
  }

  return {
    id: comment.id,
    content: comment.content,
    nickname: comment.nickname || null,
    parentId: comment.parent_id || null,
    createdAt: comment.created_at,
  };
}

/**
 * 댓글 삭제 (Soft Delete)
 */
export async function deleteComment(
  db: D1Database,
  commentId: number,
  userId: string
): Promise<boolean> {
  // 권한 확인 (작성자만 삭제 가능)
  const checkQuery = `
    SELECT id, user_id, is_deleted FROM comments
    WHERE id = ?
    LIMIT 1
  `;
  const comment = await db.prepare(checkQuery).bind(commentId).first<any>();

  if (!comment || comment.is_deleted) {
    return false;
  }

  if (comment.user_id !== userId) {
    throw new Error('FORBIDDEN');
  }

  // Soft Delete
  const deleteQuery = `
    UPDATE comments
    SET is_deleted = 1
    WHERE id = ?
  `;

  await db.prepare(deleteQuery).bind(commentId).run();

  return true;
}

/**
 * 댓글 좋아요 토글
 */
export async function toggleCommentLike(
  db: D1Database,
  commentId: number,
  userId: string
): Promise<LikeCommentResponse> {
  // 댓글 존재 확인
  const checkQuery = `
    SELECT id, is_deleted FROM comments
    WHERE id = ?
    LIMIT 1
  `;
  const comment = await db.prepare(checkQuery).bind(commentId).first<any>();

  if (!comment || comment.is_deleted) {
    throw new Error('NOT_FOUND');
  }

  // 좋아요 여부 확인
  const likeQuery = `
    SELECT 1 FROM comment_likes
    WHERE user_id = ? AND comment_id = ?
    LIMIT 1
  `;
  const existingLike = await db.prepare(likeQuery).bind(userId, commentId).first();

  let liked = false;

  if (existingLike) {
    // 좋아요 취소
    const deleteLikeQuery = `
      DELETE FROM comment_likes
      WHERE user_id = ? AND comment_id = ?
    `;
    await db.prepare(deleteLikeQuery).bind(userId, commentId).run();

    // like_count 감소
    const decrementQuery = `
      UPDATE comments
      SET like_count = like_count - 1
      WHERE id = ?
    `;
    await db.prepare(decrementQuery).bind(commentId).run();

    liked = false;
  } else {
    // 좋아요 추가
    const now = Math.floor(Date.now() / 1000);
    const insertLikeQuery = `
      INSERT INTO comment_likes (user_id, comment_id, created_at)
      VALUES (?, ?, ?)
    `;
    await db.prepare(insertLikeQuery).bind(userId, commentId, now).run();

    // like_count 증가
    const incrementQuery = `
      UPDATE comments
      SET like_count = like_count + 1
      WHERE id = ?
    `;
    await db.prepare(incrementQuery).bind(commentId).run();

    liked = true;
  }

  // 최종 like_count 조회
  const countQuery = `
    SELECT like_count FROM comments WHERE id = ?
  `;
  const result = await db.prepare(countQuery).bind(commentId).first<any>();

  return {
    liked,
    likeCount: result?.like_count || 0,
  };
}
