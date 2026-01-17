// contracts/posts.contract.ts
// 게시판 API 계약 정의

import type { PostType, UnixTimestamp } from './types';

/**
 * GET /api/v1/posts
 * 게시글 목록 조회
 */
export interface GetPostsQuery {
  page?: number;
  limit?: number;
  policyId?: string;
  type?: PostType;
}

export interface PostListItem {
  id: number;
  title: string;
  content: string;
  postType: PostType;
  nickname: string | null; // null이면 "익명#해시"
  policyId: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: UnixTimestamp;
}

/**
 * POST /api/v1/posts
 * 게시글 작성
 */
export interface CreatePostRequest {
  title: string;
  content: string;
  postType: PostType;
  policyId?: string;
  nickname?: string; // null이면 익명
}

export interface CreatePostResponse {
  id: number;
  title: string;
  content: string;
  postType: PostType;
  nickname: string | null;
  policyId: string | null;
  createdAt: UnixTimestamp;
}

/**
 * GET /api/v1/posts/:id
 * 게시글 상세 조회
 */
export interface PostDetail extends PostListItem {
  isLikedByMe?: boolean; // 로그인 시에만
  isAuthor?: boolean; // 로그인 시 본인 여부
}

/**
 * PATCH /api/v1/posts/:id
 * 게시글 수정
 */
export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

export interface UpdatePostResponse {
  id: number;
  title: string;
  content: string;
  updatedAt: UnixTimestamp;
}

/**
 * DELETE /api/v1/posts/:id
 * 게시글 삭제 (소프트 삭제)
 * Response: 204 No Content
 */

/**
 * POST /api/v1/posts/:id/like
 * 게시글 좋아요 토글
 */
export interface LikePostResponse {
  liked: boolean; // true: 좋아요 추가, false: 좋아요 취소
  likeCount: number;
}

/**
 * GET /api/v1/posts/:id/comments
 * 댓글 목록 조회
 */
export interface CommentItem {
  id: number;
  content: string;
  nickname: string | null;
  parentId: number | null;
  likeCount: number;
  isLikedByMe?: boolean; // 로그인 시에만
  isAuthor?: boolean; // 로그인 시 본인 여부
  createdAt: UnixTimestamp;
  replies?: CommentItem[]; // 대댓글
}

/**
 * POST /api/v1/posts/:id/comments
 * 댓글 작성
 */
export interface CreateCommentRequest {
  content: string;
  parentId?: number; // 대댓글인 경우
  nickname?: string; // null이면 익명
}

export interface CreateCommentResponse {
  id: number;
  content: string;
  nickname: string | null;
  parentId: number | null;
  createdAt: UnixTimestamp;
}

/**
 * DELETE /api/v1/comments/:id
 * 댓글 삭제 (소프트 삭제)
 * Response: 204 No Content
 */

/**
 * POST /api/v1/comments/:id/like
 * 댓글 좋아요 토글
 */
export interface LikeCommentResponse {
  liked: boolean;
  likeCount: number;
}
