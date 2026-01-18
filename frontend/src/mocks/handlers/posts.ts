// MSW handlers for posts API endpoints
import { http, HttpResponse } from 'msw';
import type {
  PostDetail,
  CreatePostRequest,
  CreatePostResponse,
  UpdatePostRequest,
  UpdatePostResponse,
  LikePostResponse,
  CreateCommentRequest,
  CreateCommentResponse,
  LikeCommentResponse
} from '@policy-flow/contracts';
import { mockPosts, mockPostDetail, mockComments } from '../data/posts';

// Handler logic functions
const handleGetPosts = ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const policyId = url.searchParams.get('policyId');
  const type = url.searchParams.get('type');

  let filtered = [...mockPosts];

  if (policyId) {
    filtered = filtered.filter(p => p.policyId === policyId);
  }
  if (type) {
    filtered = filtered.filter(p => p.postType === type);
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filtered.slice(start, end);

  return HttpResponse.json({
    data: paginatedData,
    meta: { page, limit, total, hasNext: end < total },
  });
};

const handleCreatePost = async ({ request }: { request: Request }) => {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return HttpResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const body = await request.json() as CreatePostRequest;

  const newPost: CreatePostResponse = {
    id: mockPosts.length + 1,
    title: body.title,
    content: body.content,
    postType: body.type,
    nickname: body.authorNickname || null,
    policyId: body.policyId || null,
    userId: 'user-1',
    likeCount: 0,
    viewCount: 0,
    createdAt: Math.floor(Date.now() / 1000),
  };

  return HttpResponse.json<{ data: CreatePostResponse }>({
    data: newPost,
  }, { status: 201 });
};

const handleGetPostDetail = ({ params }: { params: Record<string, string | readonly string[] | undefined> }) => {
  const id = parseInt(params.id as string);

  if (id === 1) {
    return HttpResponse.json<{ data: PostDetail }>({
      data: mockPostDetail,
    });
  }

  const post = mockPosts.find(p => p.id === id);
  if (!post) {
    return HttpResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Post not found' } },
      { status: 404 }
    );
  }

  const detail: PostDetail = {
    ...post,
    isLikedByMe: false,
    isAuthor: false,
  };

  return HttpResponse.json<{ data: PostDetail }>({
    data: detail,
  });
};

const handleUpdatePost = async ({ request, params }: { request: Request; params: Record<string, string | readonly string[] | undefined> }) => {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return HttpResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const body = await request.json() as UpdatePostRequest;
  const id = parseInt(params.id as string);

  const updated: UpdatePostResponse = {
    id,
    title: body.title || '제목',
    content: body.content || '내용',
    updatedAt: Math.floor(Date.now() / 1000),
  };

  return HttpResponse.json<{ data: UpdatePostResponse }>({
    data: updated,
  });
};

const handleDeletePost = ({ request }: { request: Request }) => {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return HttpResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  return new HttpResponse(null, { status: 204 });
};

const handleLikePost = ({ request }: { request: Request }) => {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return HttpResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const response: LikePostResponse = {
    liked: true,
    likeCount: 13,
  };

  return HttpResponse.json<{ data: LikePostResponse }>({
    data: response,
  });
};

const handleGetComments = () => {
  return HttpResponse.json({
    data: mockComments,
  });
};

const handleCreateComment = async ({ request }: { request: Request }) => {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return HttpResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const body = await request.json() as CreateCommentRequest;

  const newComment: CreateCommentResponse = {
    id: 100,
    content: body.content,
    nickname: body.nickname || null,
    parentId: body.parentId || null,
    createdAt: Math.floor(Date.now() / 1000),
  };

  return HttpResponse.json<{ data: CreateCommentResponse }>({
    data: newComment,
  }, { status: 201 });
};

const handleDeleteComment = ({ request }: { request: Request }) => {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return HttpResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  return new HttpResponse(null, { status: 204 });
};

const handleLikeComment = ({ request }: { request: Request }) => {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return HttpResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const response: LikeCommentResponse = {
    liked: true,
    likeCount: 6,
  };

  return HttpResponse.json<{ data: LikeCommentResponse }>({
    data: response,
  });
};

export const postsHandlers = [
  // GET /api/v1/posts (both absolute and relative URLs)
  http.get('/api/v1/posts', handleGetPosts),
  http.get('http://localhost:3001/api/v1/posts', handleGetPosts),

  // POST /api/v1/posts
  http.post('/api/v1/posts', handleCreatePost),
  http.post('http://localhost:3001/api/v1/posts', handleCreatePost),

  // GET /api/v1/posts/:id
  http.get('/api/v1/posts/:id', handleGetPostDetail),
  http.get('http://localhost:3001/api/v1/posts/:id', handleGetPostDetail),

  // PATCH /api/v1/posts/:id
  http.patch('/api/v1/posts/:id', handleUpdatePost),
  http.patch('http://localhost:3001/api/v1/posts/:id', handleUpdatePost),

  // DELETE /api/v1/posts/:id
  http.delete('/api/v1/posts/:id', handleDeletePost),
  http.delete('http://localhost:3001/api/v1/posts/:id', handleDeletePost),

  // POST /api/v1/posts/:id/like
  http.post('/api/v1/posts/:id/like', handleLikePost),
  http.post('http://localhost:3001/api/v1/posts/:id/like', handleLikePost),

  // GET /api/v1/posts/:id/comments
  http.get('/api/v1/posts/:id/comments', handleGetComments),
  http.get('http://localhost:3001/api/v1/posts/:id/comments', handleGetComments),

  // POST /api/v1/posts/:id/comments
  http.post('/api/v1/posts/:id/comments', handleCreateComment),
  http.post('http://localhost:3001/api/v1/posts/:id/comments', handleCreateComment),

  // DELETE /api/v1/comments/:id
  http.delete('/api/v1/comments/:id', handleDeleteComment),
  http.delete('http://localhost:3001/api/v1/comments/:id', handleDeleteComment),

  // POST /api/v1/comments/:id/like
  http.post('/api/v1/comments/:id/like', handleLikeComment),
  http.post('http://localhost:3001/api/v1/comments/:id/like', handleLikeComment),
];
