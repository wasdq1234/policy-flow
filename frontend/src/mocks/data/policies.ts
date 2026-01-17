// Mock policy data for testing
import type { PolicyListItem, PolicyDetail } from '@policy-flow/contracts';

const now = Math.floor(Date.now() / 1000);
const thirtyDaysLater = now + 30 * 24 * 60 * 60;
const sixtyDaysLater = now + 60 * 24 * 60 * 60;

export const mockPolicies: PolicyListItem[] = [
  {
    id: 'policy-1',
    title: '청년 월세 지원',
    summary: '서울시 청년 월세 지원 프로그램',
    category: 'HOUSING',
    region: 'SEOUL',
    status: 'OPEN',
    startDate: now,
    endDate: thirtyDaysLater,
    isAlwaysOpen: false,
  },
  {
    id: 'policy-2',
    title: '청년 취업 장려금',
    summary: '경기도 청년 취업 장려금 지원',
    category: 'EMPLOYMENT',
    region: 'GYEONGGI',
    status: 'OPEN',
    startDate: now - 7 * 24 * 60 * 60,
    endDate: sixtyDaysLater,
    isAlwaysOpen: false,
  },
  {
    id: 'policy-3',
    title: '청년 창업 지원금',
    summary: null,
    category: 'STARTUP',
    region: 'NATIONAL',
    status: 'OPEN',
    startDate: null,
    endDate: null,
    isAlwaysOpen: true,
  },
];

export const mockPolicyDetail: PolicyDetail = {
  ...mockPolicies[0],
  applyUrl: 'https://example.com/apply',
  targetAgeMin: 19,
  targetAgeMax: 34,
  detailJson: JSON.stringify({
    requirements: ['서울시 거주', '소득 요건 충족'],
    benefits: ['월 최대 20만원 지원'],
  }),
  createdAt: now - 90 * 24 * 60 * 60,
  updatedAt: now - 1 * 24 * 60 * 60,
};
