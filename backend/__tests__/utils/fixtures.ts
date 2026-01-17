/**
 * 테스트 픽스처 (Mock 데이터)
 * 반복적으로 사용되는 테스트 데이터 정의
 */
import type {
  User,
  Policy,
  Bookmark,
  Post,
  Comment,
  UnixTimestamp,
} from '@policy-flow/contracts';

/**
 * 현재 Unix 타임스탬프 생성
 */
export function now(): UnixTimestamp {
  return Math.floor(Date.now() / 1000);
}

/**
 * Mock 사용자 데이터
 */
export const mockUser: User = {
  id: 'user-test-001',
  email: 'test@example.com',
  displayName: '테스트유저',
  provider: 'google',
  createdAt: now(),
  updatedAt: now(),
};

/**
 * Mock 사용자 목록 (다양한 케이스)
 */
export const mockUsers: User[] = [
  mockUser,
  {
    id: 'user-test-002',
    email: 'user2@example.com',
    displayName: '사용자2',
    provider: 'kakao',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'user-test-003',
    email: null,
    displayName: '익명유저',
    provider: 'anonymous',
    createdAt: now(),
    updatedAt: now(),
  },
];

/**
 * Mock 정책 데이터
 */
export const mockPolicy: Policy = {
  id: 'policy-test-001',
  title: '청년 월세 지원 사업',
  summary: '만 19세~34세 청년에게 월세를 지원하는 사업입니다.',
  category: 'HOUSING',
  region: 'SEOUL',
  startDate: now() - 86400 * 30, // 30일 전
  endDate: now() + 86400 * 60, // 60일 후
  isAlwaysOpen: false,
  url: 'https://example.com/policy/001',
  createdAt: now() - 86400 * 30,
  updatedAt: now(),
};

/**
 * Mock 정책 목록 (다양한 카테고리/지역)
 */
export const mockPolicies: Policy[] = [
  mockPolicy,
  {
    id: 'policy-test-002',
    title: '취업 성공 패키지',
    summary: '청년 취업 지원 프로그램',
    category: 'EMPLOYMENT',
    region: 'NATIONWIDE',
    startDate: null,
    endDate: null,
    isAlwaysOpen: true,
    url: 'https://example.com/policy/002',
    createdAt: now() - 86400 * 60,
    updatedAt: now(),
  },
  {
    id: 'policy-test-003',
    title: '청년 창업 지원금',
    summary: '창업 초기 자금 지원',
    category: 'ENTREPRENEURSHIP',
    region: 'BUSAN',
    startDate: now() - 86400 * 10,
    endDate: now() + 86400 * 20,
    isAlwaysOpen: false,
    url: 'https://example.com/policy/003',
    createdAt: now() - 86400 * 15,
    updatedAt: now(),
  },
];

/**
 * Mock 북마크 데이터
 */
export const mockBookmark: Bookmark = {
  id: 'bookmark-test-001',
  userId: mockUser.id,
  policyId: mockPolicy.id,
  createdAt: now(),
};

/**
 * Mock 북마크 목록
 */
export const mockBookmarks: Bookmark[] = [
  mockBookmark,
  {
    id: 'bookmark-test-002',
    userId: mockUser.id,
    policyId: mockPolicies[1].id,
    createdAt: now() - 86400,
  },
];

/**
 * Mock 게시글 데이터
 */
export const mockPost: Post = {
  id: 'post-test-001',
  userId: mockUser.id,
  policyId: mockPolicy.id,
  type: 'tip',
  title: '이 정책 신청 꿀팁!',
  content: '서류 준비는 이렇게 하면 쉬워요...',
  likeCount: 10,
  commentCount: 3,
  createdAt: now() - 86400,
  updatedAt: now(),
};

/**
 * Mock 게시글 목록
 */
export const mockPosts: Post[] = [
  mockPost,
  {
    id: 'post-test-002',
    userId: mockUsers[1].id,
    policyId: null,
    type: 'question',
    title: '정책 문의드립니다',
    content: '이런 경우는 어떻게 하나요?',
    likeCount: 2,
    commentCount: 1,
    createdAt: now() - 86400 * 2,
    updatedAt: now() - 86400 * 2,
  },
  {
    id: 'post-test-003',
    userId: mockUsers[0].id,
    policyId: mockPolicies[1].id,
    type: 'review',
    title: '수혜 후기 공유',
    content: '덕분에 큰 도움 받았습니다!',
    likeCount: 25,
    commentCount: 5,
    createdAt: now() - 86400 * 5,
    updatedAt: now() - 86400 * 5,
  },
];

/**
 * Mock 댓글 데이터
 */
export const mockComment: Comment = {
  id: 'comment-test-001',
  postId: mockPost.id,
  userId: mockUsers[1].id,
  content: '좋은 정보 감사합니다!',
  createdAt: now() - 3600,
  updatedAt: now() - 3600,
};

/**
 * Mock 댓글 목록
 */
export const mockComments: Comment[] = [
  mockComment,
  {
    id: 'comment-test-002',
    postId: mockPost.id,
    userId: mockUsers[2].id,
    content: '저도 신청해봐야겠어요.',
    createdAt: now() - 1800,
    updatedAt: now() - 1800,
  },
];

/**
 * 임의의 ID 생성
 */
export function generateMockId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Mock 데이터 생성 팩토리
 */
export const createMock = {
  user: (overrides?: Partial<User>): User => ({
    ...mockUser,
    id: generateMockId('user'),
    ...overrides,
  }),

  policy: (overrides?: Partial<Policy>): Policy => ({
    ...mockPolicy,
    id: generateMockId('policy'),
    ...overrides,
  }),

  bookmark: (overrides?: Partial<Bookmark>): Bookmark => ({
    ...mockBookmark,
    id: generateMockId('bookmark'),
    ...overrides,
  }),

  post: (overrides?: Partial<Post>): Post => ({
    ...mockPost,
    id: generateMockId('post'),
    ...overrides,
  }),

  comment: (overrides?: Partial<Comment>): Comment => ({
    ...mockComment,
    id: generateMockId('comment'),
    ...overrides,
  }),
};
