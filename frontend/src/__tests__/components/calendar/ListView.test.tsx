import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListView } from '@/src/components/calendar/ListView';
import type { PolicyListItem } from '@policy-flow/contracts';

describe('ListView', () => {
  const mockPolicies: PolicyListItem[] = [
    {
      id: 'policy-1',
      title: '청년 월세 지원',
      summary: '서울시 청년 월세 지원 프로그램',
      category: 'HOUSING',
      region: 'SEOUL',
      status: 'OPEN',
      startDate: Math.floor(Date.now() / 1000),
      endDate: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      isAlwaysOpen: false,
    },
    {
      id: 'policy-2',
      title: '청년 취업 장려금',
      summary: '경기도 청년 취업 장려금 지원',
      category: 'JOB',
      region: 'GYEONGGI',
      status: 'CLOSING_SOON',
      startDate: Math.floor(Date.now() / 1000),
      endDate: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      isAlwaysOpen: false,
    },
  ];

  it('정책 목록을 렌더링한다', () => {
    render(<ListView policies={mockPolicies} onPolicyClick={() => {}} />);

    expect(screen.getByText('청년 월세 지원')).toBeInTheDocument();
    expect(screen.getByText('청년 취업 장려금')).toBeInTheDocument();
  });

  it('정책 요약을 렌더링한다', () => {
    render(<ListView policies={mockPolicies} onPolicyClick={() => {}} />);

    expect(screen.getByText('서울시 청년 월세 지원 프로그램')).toBeInTheDocument();
    expect(screen.getByText('경기도 청년 취업 장려금 지원')).toBeInTheDocument();
  });

  it('정책 상태를 렌더링한다', () => {
    render(<ListView policies={mockPolicies} onPolicyClick={() => {}} />);

    expect(screen.getByText('접수중')).toBeInTheDocument();
    expect(screen.getByText('마감임박')).toBeInTheDocument();
  });

  it('정책 카테고리와 지역을 렌더링한다', () => {
    render(<ListView policies={mockPolicies} onPolicyClick={() => {}} />);

    expect(screen.getByText('주거/생활')).toBeInTheDocument();
    expect(screen.getByText('서울')).toBeInTheDocument();
    expect(screen.getByText('취업/창업')).toBeInTheDocument();
    expect(screen.getByText('경기')).toBeInTheDocument();
  });

  it('정책 클릭 시 onPolicyClick을 호출한다', async () => {
    const user = userEvent.setup();
    const onPolicyClick = vi.fn();

    render(<ListView policies={mockPolicies} onPolicyClick={onPolicyClick} />);

    const policyCard = screen.getByText('청년 월세 지원').closest('div[role="button"]');
    if (policyCard) {
      await user.click(policyCard);
    }

    expect(onPolicyClick).toHaveBeenCalledWith(mockPolicies[0]);
  });

  it('빈 목록일 때 메시지를 렌더링한다', () => {
    render(<ListView policies={[]} onPolicyClick={() => {}} />);

    expect(screen.getByText('정책이 없습니다')).toBeInTheDocument();
  });
});
