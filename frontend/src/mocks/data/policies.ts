// Mock policy data for testing
import type { PolicyListItem, PolicyDetail } from '@policy-flow/contracts';

const now = Math.floor(Date.now() / 1000);
const thirtyDaysLater = now + 30 * 24 * 60 * 60;
const sixtyDaysLater = now + 60 * 24 * 60 * 60;
const sevenDaysLater = now + 7 * 24 * 60 * 60;
const threeDaysLater = now + 3 * 24 * 60 * 60;
const tenDaysAgo = now - 10 * 24 * 60 * 60;
const fiveDaysAgo = now - 5 * 24 * 60 * 60;
const twentyDaysAgo = now - 20 * 24 * 60 * 60;
const fifteenDaysLater = now + 15 * 24 * 60 * 60;

export const mockPolicies: PolicyListItem[] = [
  {
    id: 'policy-1',
    title: '청년 월세 지원',
    summary: '서울시 청년 월세 지원 프로그램',
    category: 'HOUSING',
    region: 'SEOUL',
    status: 'OPEN',
    startDate: tenDaysAgo,
    endDate: thirtyDaysLater,
    isAlwaysOpen: false,
  },
  {
    id: 'policy-2',
    title: '청년 취업 장려금',
    summary: '경기도 청년 취업 장려금 지원',
    category: 'JOB',
    region: 'GYEONGGI',
    status: 'OPEN',
    startDate: fiveDaysAgo,
    endDate: sixtyDaysLater,
    isAlwaysOpen: false,
  },
  {
    id: 'policy-3',
    title: '청년 창업 지원금',
    summary: '전국 청년 창업 지원금',
    category: 'STARTUP',
    region: 'ALL',
    status: 'OPEN',
    startDate: null,
    endDate: null,
    isAlwaysOpen: true,
  },
  {
    id: 'policy-4',
    title: '청년 학자금 대출',
    summary: '저금리 학자금 대출 지원',
    category: 'LOAN',
    region: 'ALL',
    status: 'CLOSING_SOON',
    startDate: twentyDaysAgo,
    endDate: threeDaysLater,
    isAlwaysOpen: false,
  },
  {
    id: 'policy-5',
    title: '부산 청년 문화 패스',
    summary: '부산시 청년 문화생활 지원',
    category: 'WELFARE',
    region: 'BUSAN',
    status: 'CLOSING_SOON',
    startDate: fiveDaysAgo,
    endDate: sevenDaysLater,
    isAlwaysOpen: false,
  },
  {
    id: 'policy-6',
    title: '대전 청년 교육 지원',
    summary: '대전시 청년 교육비 지원',
    category: 'EDUCATION',
    region: 'DAEJEON',
    status: 'UPCOMING',
    startDate: fifteenDaysLater,
    endDate: sixtyDaysLater,
    isAlwaysOpen: false,
  },
  {
    id: 'policy-7',
    title: '인천 청년 취업 캠프',
    summary: '인천시 청년 취업 부트캠프',
    category: 'JOB',
    region: 'INCHEON',
    status: 'CLOSED',
    startDate: twentyDaysAgo,
    endDate: tenDaysAgo,
    isAlwaysOpen: false,
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
