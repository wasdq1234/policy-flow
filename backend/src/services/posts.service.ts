/**
 * 게시글 서비스
 * 게시글 목록 조회, 생성, 수정, 삭제, 좋아요
 */
import type { D1Database } from '@cloudflare/workers-types';
import type {
  PostListItem,
  GetPostsQuery,
  CreatePostRequest,
  CreatePostResponse,
  PostDetail,
  UpdatePostRequest,
  UpdatePostResponse,
  LikePostResponse,
} from '../../../contracts/schemas/posts';
import { nanoid } from 'nanoid';

/**
 * 게시글 목록 조회 (필터링 + 페이지네이션)
 */
export async function getPosts(
  db: D1Database,
  query: GetPostsQuery
): Promise<{ data: PostListItem[]; total: number }> {
  // WHERE 조건 구성
  const whereClauses: string[] = ['is_deleted = 0'];
  const params: any[] = [];

  if (query.type) {
    whereClauses.push('post_type = ?');
    params.push(query.type);
  }

  if (query.policyId) {
    whereClauses.push('policy_id = ?');
    params.push(query.policyId);
  }

  const whereClause = `WHERE ${whereClauses.join(' AND ')}`;

  // 전체 개수 조회
  const countQuery = `SELECT COUNT(*) as count FROM posts ${whereClause}`;
  const countResult = await db.prepare(countQuery).bind(...params).first<{ count: number }>();
  const total = countResult?.count || 0;

  // 페이지네이션 계산
  const offset = (query.page - 1) * query.limit;

  // 데이터 조회
  const dataQuery = `
    SELECT
      id, title, content, post_type, nickname, policy_id, user_id,
      view_count, like_count, created_at
    FROM posts
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  const dataResult = await db
    .prepare(dataQuery)
    .bind(...params, query.limit, offset)
    .all<any>();

  // DB 결과를 PostListItem으로 변환
  const data: PostListItem[] = (dataResult.results || []).map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    postType: row.post_type,
    nickname: row.nickname || null,
    policyId: row.policy_id || null,
    userId: row.user_id || null,
    viewCount: row.view_count || 0,
    likeCount: row.like_count || 0,
    commentCount: 0, // TODO: 댓글 수 계산 (현재는 0)
    createdAt: row.created_at,
  }));

  return { data, total };
}

/**
 * 게시글 생성
 */
export async function createPost(
  db: D1Database,
  userId: string,
  request: CreatePostRequest
): Promise<CreatePostResponse> {
  const now = Math.floor(Date.now() / 1000);

  const insertQuery = `
    INSERT INTO posts (
      policy_id, user_id, nickname, title, content, post_type,
      view_count, like_count, is_deleted, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, ?, NULL)
  `;

  const result = await db
    .prepare(insertQuery)
    .bind(
      request.policyId || null,
      userId,
      request.authorNickname || null,
      request.title,
      request.content,
      request.type,
      now
    )
    .run();

  // D1의 last_row_id를 사용하여 생성된 ID 가져오기
  // SQLite의 RETURNING을 사용할 수 없으므로, 다시 조회
  const selectQuery = `
    SELECT id, title, content, post_type, nickname, policy_id, user_id,
           like_count, view_count, created_at
    FROM posts
    WHERE user_id = ? AND title = ?
    ORDER BY id DESC
    LIMIT 1
  `;

  const post = await db.prepare(selectQuery).bind(userId, request.title).first<any>();

  if (!post) {
    throw new Error('게시글 생성에 실패했습니다.');
  }

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    postType: post.post_type,
    nickname: post.nickname || null,
    policyId: post.policy_id || null,
    userId: post.user_id || null,
    likeCount: post.like_count || 0,
    viewCount: post.view_count || 0,
    createdAt: post.created_at,
  };
}

/**
 * 게시글 상세 조회 (조회수 증가)
 */
export async function getPostById(
  db: D1Database,
  postId: number,
  userId?: string
): Promise<PostDetail | null> {
  const query = `
    SELECT
      id, title, content, post_type, nickname, policy_id, user_id,
      view_count, like_count, created_at, updated_at, is_deleted
    FROM posts
    WHERE id = ?
    LIMIT 1
  `;

  const result = await db.prepare(query).bind(postId).first<any>();

  if (!result || result.is_deleted) {
    return null;
  }

  // 조회수 증가
  const updateViewCountQuery = `
    UPDATE posts
    SET view_count = view_count + 1
    WHERE id = ?
  `;
  await db.prepare(updateViewCountQuery).bind(postId).run();

  // 좋아요 여부 확인 (userId가 있는 경우)
  let isLikedByMe = false;
  if (userId) {
    const likeQuery = `
      SELECT 1 FROM post_likes
      WHERE user_id = ? AND post_id = ?
      LIMIT 1
    `;
    const likeResult = await db.prepare(likeQuery).bind(userId, postId).first();
    isLikedByMe = !!likeResult;
  }

  const isAuthor = userId ? result.user_id === userId : false;

  return {
    id: result.id,
    title: result.title,
    content: result.content,
    postType: result.post_type,
    nickname: result.nickname || null,
    policyId: result.policy_id || null,
    userId: result.user_id || null,
    viewCount: (result.view_count || 0) + 1, // 증가된 조회수 반영
    likeCount: result.like_count || 0,
    commentCount: 0, // TODO: 댓글 수 계산
    createdAt: result.created_at,
    isLikedByMe,
    isAuthor,
  };
}

/**
 * 게시글 수정
 */
export async function updatePost(
  db: D1Database,
  postId: number,
  userId: string,
  request: UpdatePostRequest
): Promise<UpdatePostResponse | null> {
  // 권한 확인 (작성자만 수정 가능)
  const checkQuery = `
    SELECT id, user_id, is_deleted FROM posts
    WHERE id = ?
    LIMIT 1
  `;
  const post = await db.prepare(checkQuery).bind(postId).first<any>();

  if (!post || post.is_deleted) {
    return null;
  }

  if (post.user_id !== userId) {
    throw new Error('FORBIDDEN');
  }

  const now = Math.floor(Date.now() / 1000);

  // UPDATE 쿼리 동적 생성
  const updates: string[] = [];
  const params: any[] = [];

  if (request.title !== undefined) {
    updates.push('title = ?');
    params.push(request.title);
  }

  if (request.content !== undefined) {
    updates.push('content = ?');
    params.push(request.content);
  }

  updates.push('updated_at = ?');
  params.push(now);

  params.push(postId);

  const updateQuery = `
    UPDATE posts
    SET ${updates.join(', ')}
    WHERE id = ?
  `;

  await db.prepare(updateQuery).bind(...params).run();

  // 수정된 데이터 조회
  const selectQuery = `
    SELECT id, title, content, updated_at
    FROM posts
    WHERE id = ?
    LIMIT 1
  `;

  const updated = await db.prepare(selectQuery).bind(postId).first<any>();

  if (!updated) {
    return null;
  }

  return {
    id: updated.id,
    title: updated.title,
    content: updated.content,
    updatedAt: updated.updated_at,
  };
}

/**
 * 게시글 삭제 (Soft Delete)
 */
export async function deletePost(
  db: D1Database,
  postId: number,
  userId: string
): Promise<boolean> {
  // 권한 확인 (작성자만 삭제 가능)
  const checkQuery = `
    SELECT id, user_id, is_deleted FROM posts
    WHERE id = ?
    LIMIT 1
  `;
  const post = await db.prepare(checkQuery).bind(postId).first<any>();

  if (!post || post.is_deleted) {
    return false;
  }

  if (post.user_id !== userId) {
    throw new Error('FORBIDDEN');
  }

  // Soft Delete
  const deleteQuery = `
    UPDATE posts
    SET is_deleted = 1
    WHERE id = ?
  `;

  await db.prepare(deleteQuery).bind(postId).run();

  return true;
}

/**
 * 좋아요 토글
 */
export async function toggleLike(
  db: D1Database,
  postId: number,
  userId: string
): Promise<LikePostResponse> {
  // 게시글 존재 확인
  const checkQuery = `
    SELECT id, is_deleted FROM posts
    WHERE id = ?
    LIMIT 1
  `;
  const post = await db.prepare(checkQuery).bind(postId).first<any>();

  if (!post || post.is_deleted) {
    throw new Error('NOT_FOUND');
  }

  // 좋아요 여부 확인
  const likeQuery = `
    SELECT 1 FROM post_likes
    WHERE user_id = ? AND post_id = ?
    LIMIT 1
  `;
  const existingLike = await db.prepare(likeQuery).bind(userId, postId).first();

  let liked = false;

  if (existingLike) {
    // 좋아요 취소
    const deleteLikeQuery = `
      DELETE FROM post_likes
      WHERE user_id = ? AND post_id = ?
    `;
    await db.prepare(deleteLikeQuery).bind(userId, postId).run();

    // like_count 감소
    const decrementQuery = `
      UPDATE posts
      SET like_count = like_count - 1
      WHERE id = ?
    `;
    await db.prepare(decrementQuery).bind(postId).run();

    liked = false;
  } else {
    // 좋아요 추가
    const now = Math.floor(Date.now() / 1000);
    const insertLikeQuery = `
      INSERT INTO post_likes (user_id, post_id, created_at)
      VALUES (?, ?, ?)
    `;
    await db.prepare(insertLikeQuery).bind(userId, postId, now).run();

    // like_count 증가
    const incrementQuery = `
      UPDATE posts
      SET like_count = like_count + 1
      WHERE id = ?
    `;
    await db.prepare(incrementQuery).bind(postId).run();

    liked = true;
  }

  // 최종 like_count 조회
  const countQuery = `
    SELECT like_count FROM posts WHERE id = ?
  `;
  const result = await db.prepare(countQuery).bind(postId).first<any>();

  return {
    liked,
    likeCount: result?.like_count || 0,
  };
}
