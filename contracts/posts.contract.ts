// contracts/posts.contract.ts
// 게시판 API 계약 정의
// 타입은 schemas/posts.ts에 정의되어 있음

// Re-export types from schemas
export type {
  GetPostsQuery,
  PostListItem,
  CreatePostRequest,
  CreatePostResponse,
  PostDetail,
  UpdatePostRequest,
  UpdatePostResponse,
  LikePostResponse,
} from './schemas/posts';

// Comment types
export interface CommentItem {
  id: number;
  content: string;
  nickname: string | null;
  parentId: number | null;
  likeCount: number;
  isLikedByMe?: boolean;
  isAuthor?: boolean;
  createdAt: number;
  replies?: CommentItem[];
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
