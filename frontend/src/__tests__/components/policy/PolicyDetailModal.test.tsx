import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PolicyDetailModal } from '@/src/components/policy/PolicyDetailModal';
import type { PolicyDetail } from '@policy-flow/contracts';

const mockPolicyDetail: PolicyDetail = {
  id: 'policy-1',
  title: '청년 취업 지원금',
  summary: '청년 취업을 지원하는 정책입니다.',
  category: 'JOB',
  region: 'SEOUL',
  status: 'OPEN',
  startDate: 1704067200, // 2024-01-01
  endDate: 1735689599, // 2024-12-31
  isAlwaysOpen: false,
  applyUrl: 'https://example.com/apply',
  targetAgeMin: 19,
  targetAgeMax: 34,
  detailJson: null,
  createdAt: 1704067200,
  updatedAt: 1704067200,
};

const mockAlwaysOpenPolicy: PolicyDetail = {
  ...mockPolicyDetail,
  id: 'policy-2',
  title: '상시 접수 정책',
  isAlwaysOpen: true,
  startDate: null,
  endDate: null,
};

describe('PolicyDetailModal', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('로딩 상태 표시', () => {
    vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}));

    render(<PolicyDetailModal policyId="policy-1" onClose={vi.fn()} />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('에러 상태 표시', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    render(<PolicyDetailModal policyId="policy-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/에러가 발생했습니다/)).toBeInTheDocument();
    });
  });

  it('정책 제목 표시', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPolicyDetail }),
    } as Response);

    render(<PolicyDetailModal policyId="policy-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('청년 취업 지원금')).toBeInTheDocument();
    });
  });

  it('정책 요약 표시', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPolicyDetail }),
    } as Response);

    render(<PolicyDetailModal policyId="policy-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(
        screen.getByText('청년 취업을 지원하는 정책입니다.')
      ).toBeInTheDocument();
    });
  });

  it('신청 기간 표시 (startDate ~ endDate)', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPolicyDetail }),
    } as Response);

    render(<PolicyDetailModal policyId="policy-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });
  });

  it('상시 접수 표시', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockAlwaysOpenPolicy }),
    } as Response);

    render(<PolicyDetailModal policyId="policy-2" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('상시 접수')).toBeInTheDocument();
    });
  });

  it('상태 배지 표시', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPolicyDetail }),
    } as Response);

    render(<PolicyDetailModal policyId="policy-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('접수중')).toBeInTheDocument();
    });
  });

  it('카테고리 표시', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPolicyDetail }),
    } as Response);

    render(<PolicyDetailModal policyId="policy-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('취업·일자리')).toBeInTheDocument();
    });
  });

  it('지역 표시', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPolicyDetail }),
    } as Response);

    render(<PolicyDetailModal policyId="policy-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('서울')).toBeInTheDocument();
    });
  });

  it('신청하기 버튼 링크', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPolicyDetail }),
    } as Response);

    render(<PolicyDetailModal policyId="policy-1" onClose={vi.fn()} />);

    await waitFor(() => {
      const applyButton = screen.getByRole('link', { name: /신청하기/ });
      expect(applyButton).toHaveAttribute('href', 'https://example.com/apply');
      expect(applyButton).toHaveAttribute('target', '_blank');
    });
  });

  it('북마크 버튼 존재', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPolicyDetail }),
    } as Response);

    render(<PolicyDetailModal policyId="policy-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /북마크/ })).toBeInTheDocument();
    });
  });

  it('닫기 버튼 클릭 시 onClose 호출', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPolicyDetail }),
    } as Response);

    const onClose = vi.fn();
    render(<PolicyDetailModal policyId="policy-1" onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('청년 취업 지원금')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /닫기/ });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('백드롭 클릭 시 onClose 호출', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPolicyDetail }),
    } as Response);

    const onClose = vi.fn();
    render(<PolicyDetailModal policyId="policy-1" onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('청년 취업 지원금')).toBeInTheDocument();
    });

    const backdrop = screen.getByRole('dialog').parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('ESC 키로 닫기', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPolicyDetail }),
    } as Response);

    const onClose = vi.fn();
    render(<PolicyDetailModal policyId="policy-1" onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('청년 취업 지원금')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('대상 연령 표시', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPolicyDetail }),
    } as Response);

    render(<PolicyDetailModal policyId="policy-1" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/19세 ~ 34세/)).toBeInTheDocument();
    });
  });
});
