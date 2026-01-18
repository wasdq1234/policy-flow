// Mock post data for testing
import type { PostListItem, PostDetail, CommentItem } from '@policy-flow/contracts';

const now = Math.floor(Date.now() / 1000);

export const mockPosts: PostListItem[] = [
  {
    id: 1,
    title: '청년 월세 지원 신청 후기',
    content: '신청 과정이 생각보다 간단했어요...',
    postType: 'REVIEW',
    nickname: '테스트유저',
    policyId: 'policy-1',
    userId: 'user-1',
    viewCount: 150,
    likeCount: 12,
    commentCount: 5,
    createdAt: now - 3600,
  },
  {
    id: 2,
    title: '취업 장려금 신청 방법 문의',
    content: '신청 방법이 잘 모르겠어서요...',
    postType: 'QUESTION',
    nickname: null,
    policyId: 'policy-2',
    userId: null,
    viewCount: 80,
    likeCount: 3,
    commentCount: 2,
    createdAt: now - 7200,
  },
  {
    id: 3,
    title: '청년 정책 관련 정보 공유',
    content: '유용한 정보 공유합니다...',
    postType: 'TIP',
    nickname: '정책전문가',
    policyId: null,
    userId: 'user-2',
    viewCount: 200,
    likeCount: 25,
    commentCount: 8,
    createdAt: now - 86400,
  },
];

export const mockPostDetail: PostDetail = {
  ...mockPosts[0],
  isLikedByMe: false,
  isAuthor: false,
};

export const mockComments: CommentItem[] = [
  {
    id: 1,
    content: '유용한 정보 감사합니다!',
    nickname: '댓글작성자1',
    parentId: null,
    likeCount: 5,
    isLikedByMe: false,
    isAuthor: false,
    createdAt: now - 1800,
    replies: [
      {
        id: 2,
        content: '저도 도움 되었어요',
        nickname: null,
        parentId: 1,
        likeCount: 1,
        isLikedByMe: false,
        isAuthor: false,
        createdAt: now - 900,
        replies: [],
      },
    ],
  },
  {
    id: 3,
    content: '궁금한 점이 있는데요...',
    nickname: null,
    parentId: null,
    likeCount: 0,
    isLikedByMe: false,
    isAuthor: false,
    createdAt: now - 600,
    replies: [],
  },
];
