// contracts/schemas/posts.ts
// 게시판 API Zod 스키마

import { z } from 'zod';
import { POST_TYPES } from '../constants';

/**
 * GET /api/v1/posts
 */
export const getPostsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  policyId: z.string().optional(),
  type: z.enum(POST_TYPES).optional(),
});

export const postListItemSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  content: z.string(),
  postType: z.enum(POST_TYPES),
  nickname: z.string().nullable(),
  policyId: z.string().nullable(),
  userId: z.string().nullable(),
  viewCount: z.number().int().nonnegative(),
  likeCount: z.number().int().nonnegative(),
  commentCount: z.number().int().nonnegative(),
  createdAt: z.number().int().positive(),
});

/**
 * POST /api/v1/posts
 */
export const createPostRequestSchema = z.object({
  title: z.string().min(1, '제목이 필요합니다').max(200, '제목은 200자 이하여야 합니다'),
  content: z.string().min(1, '내용이 필요합니다').max(2000, '내용은 2000자 이하여야 합니다'),
  type: z.enum(POST_TYPES),
  policyId: z.string().optional(),
  authorNickname: z.string().max(20).optional(),
});

export const createPostResponseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  content: z.string(),
  postType: z.enum(POST_TYPES),
  nickname: z.string().nullable(),
  policyId: z.string().nullable(),
  userId: z.string().nullable(),
  likeCount: z.number().int().nonnegative(),
  viewCount: z.number().int().nonnegative(),
  createdAt: z.number().int().positive(),
});

/**
 * GET /api/v1/posts/:id
 */
export const postDetailSchema = postListItemSchema.extend({
  isLikedByMe: z.boolean().optional(),
  isAuthor: z.boolean().optional(),
});

/**
 * PATCH /api/v1/posts/:id
 */
export const updatePostRequestSchema = z.object({
  title: z.string().min(1).max(50).optional(),
  content: z.string().min(1).max(2000).optional(),
});

export const updatePostResponseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  content: z.string(),
  updatedAt: z.number().int().positive(),
});

/**
 * POST /api/v1/posts/:id/like
 */
export const likePostResponseSchema = z.object({
  liked: z.boolean(),
  likeCount: z.number().int().nonnegative(),
});

/**
 * GET /api/v1/posts/:id/comments
 */
export const commentItemSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.number().int().positive(),
    content: z.string(),
    nickname: z.string().nullable(),
    parentId: z.number().int().nullable(),
    likeCount: z.number().int().nonnegative(),
    isLikedByMe: z.boolean().optional(),
    isAuthor: z.boolean().optional(),
    createdAt: z.number().int().positive(),
    replies: z.array(commentItemSchema).optional(),
  })
);

/**
 * POST /api/v1/posts/:id/comments
 */
export const createCommentRequestSchema = z.object({
  content: z.string().min(1, '내용이 필요합니다').max(500, '댓글은 500자 이하여야 합니다'),
  parentId: z.number().int().positive().optional(),
  nickname: z.string().max(20).optional(),
});

export const createCommentResponseSchema = z.object({
  id: z.number().int().positive(),
  content: z.string(),
  nickname: z.string().nullable(),
  parentId: z.number().int().nullable(),
  createdAt: z.number().int().positive(),
});

/**
 * POST /api/v1/comments/:id/like
 */
export const likeCommentResponseSchema = z.object({
  liked: z.boolean(),
  likeCount: z.number().int().nonnegative(),
});

// TypeScript 타입
export type GetPostsQuery = z.infer<typeof getPostsQuerySchema>;
export type PostListItem = z.infer<typeof postListItemSchema>;
export type CreatePostRequest = z.infer<typeof createPostRequestSchema>;
export type CreatePostResponse = z.infer<typeof createPostResponseSchema>;
export type PostDetail = z.infer<typeof postDetailSchema>;
export type UpdatePostRequest = z.infer<typeof updatePostRequestSchema>;
export type UpdatePostResponse = z.infer<typeof updatePostResponseSchema>;
export type LikePostResponse = z.infer<typeof likePostResponseSchema>;
