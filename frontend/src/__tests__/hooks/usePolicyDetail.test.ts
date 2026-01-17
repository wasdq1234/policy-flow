import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePolicyDetail } from '@/src/hooks/usePolicyDetail';
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
  detailJson: '{"content":"상세정보"}',
  createdAt: 1704067200,
  updatedAt: 1704067200,
};

describe('usePolicyDetail', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('초기 상태는 로딩 중', () => {
    vi.mocked(global.fetch).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => usePolicyDetail('policy-1'));

    expect(result.current.policy).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('정책 상세 정보를 성공적으로 가져옴', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPolicyDetail }),
    } as Response);

    const { result } = renderHook(() => usePolicyDetail('policy-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.policy).toEqual(mockPolicyDetail);
    expect(result.current.error).toBeNull();
    expect(global.fetch).toHaveBeenCalledWith('/api/v1/policies/policy-1');
  });

  it('네트워크 에러 시 에러 상태 설정', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    } as Response);

    const { result } = renderHook(() => usePolicyDetail('policy-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.policy).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('Not Found');
  });

  it('fetch 실패 시 에러 상태 설정', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => usePolicyDetail('policy-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.policy).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network error');
  });

  it('policyId가 변경되면 다시 fetch', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPolicyDetail }),
    } as Response);

    const { result, rerender } = renderHook(
      ({ id }) => usePolicyDetail(id),
      { initialProps: { id: 'policy-1' } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/v1/policies/policy-1');

    // policyId 변경
    rerender({ id: 'policy-2' });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/policies/policy-2');
    });
  });
});
