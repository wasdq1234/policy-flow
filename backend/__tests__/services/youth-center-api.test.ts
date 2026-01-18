/**
 * 청년센터 API 서비스 테스트 (TDD RED)
 * Phase 5, T5.1 - 청년센터 API 연동
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fetchYouthCenterPolicies,
  mapToPolicy,
  CATEGORY_MAP,
  REGION_MAP,
} from '@/services/youth-center-api.service';

// Mock fetch
global.fetch = vi.fn();

describe('youth-center-api.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchYouthCenterPolicies', () => {
    it('should fetch policies from API with pagination', async () => {
      const mockResponse = {
        pageIndex: 1,
        totalCnt: 2,
        youthPolicyList: [
          {
            bizId: 'R2024001',
            polyBizSjnm: '청년 일자리 지원',
            polyItcnCn: '청년 취업 지원 정책',
            cnsgNmor: '서울시',
            polyRlmCd: '023010',
            rqutPrdCn: '2024.01.01~2024.12.31',
            rqutUrla: 'https://example.com/apply',
            rfcSiteUrla1: 'https://example.com/detail',
          },
          {
            bizId: 'R2024002',
            polyBizSjnm: '청년 주거 지원',
            polyItcnCn: '청년 주거 비용 지원',
            cnsgNmor: '부산광역시',
            polyRlmCd: '023020',
            rqutPrdCn: '상시모집',
            rqutUrla: 'https://example.com/apply2',
            rfcSiteUrla1: 'https://example.com/detail2',
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchYouthCenterPolicies({
        apiKey: 'test-api-key',
        pageIndex: 1,
        display: 2,
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('pageIndex=1'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('display=2'),
        expect.any(Object)
      );
    });

    it('should throw error when API fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        fetchYouthCenterPolicies({
          apiKey: 'test-api-key',
          pageIndex: 1,
          display: 10,
        })
      ).rejects.toThrow('청년센터 API 호출 실패');
    });

    it('should throw error when network fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        fetchYouthCenterPolicies({
          apiKey: 'test-api-key',
          pageIndex: 1,
          display: 10,
        })
      ).rejects.toThrow('청년센터 API 호출 중 오류');
    });
  });

  describe('CATEGORY_MAP', () => {
    it('should map categories correctly', () => {
      expect(CATEGORY_MAP['023010']).toBe('JOB'); // 일자리
      expect(CATEGORY_MAP['023020']).toBe('HOUSING'); // 주거
      expect(CATEGORY_MAP['023030']).toBe('EDUCATION'); // 교육
      expect(CATEGORY_MAP['023040']).toBe('WELFARE'); // 복지문화
      expect(CATEGORY_MAP['023050']).toBe('STARTUP'); // 참여권리
    });

    it('should have default fallback to WELFARE', () => {
      // 테스트에서는 mapToPolicy 함수에서 기본값을 확인
      expect(CATEGORY_MAP['unknown']).toBeUndefined();
    });
  });

  describe('REGION_MAP', () => {
    it('should map regions correctly', () => {
      expect(REGION_MAP['서울']).toBe('SEOUL');
      expect(REGION_MAP['서울시']).toBe('SEOUL');
      expect(REGION_MAP['서울특별시']).toBe('SEOUL');
      expect(REGION_MAP['부산']).toBe('BUSAN');
      expect(REGION_MAP['부산광역시']).toBe('BUSAN');
      expect(REGION_MAP['중앙부처']).toBe('ALL');
      expect(REGION_MAP['전국']).toBe('ALL');
    });
  });

  describe('mapToPolicy', () => {
    it('should map youth center policy to DB policy', () => {
      const youthPolicy = {
        bizId: 'R2024001',
        polyBizSjnm: '청년 일자리 지원',
        polyItcnCn: '청년 취업 지원 정책입니다.',
        cnsgNmor: '서울시',
        polyRlmCd: '023010',
        rqutPrdCn: '2024.01.01~2024.12.31',
        rqutUrla: 'https://example.com/apply',
        rfcSiteUrla1: 'https://example.com/detail',
      };

      const result = mapToPolicy(youthPolicy);

      expect(result.id).toBe('R2024001');
      expect(result.title).toBe('청년 일자리 지원');
      expect(result.summary).toBe('청년 취업 지원 정책입니다.');
      expect(result.category).toBe('JOB');
      expect(result.region).toBe('SEOUL');
      expect(result.isAlwaysOpen).toBe(false);
      expect(result.applyUrl).toBe('https://example.com/apply');
      expect(result.detailJson).toContain('"source_url":"https://example.com/detail"');
    });

    it('should handle always-open policies', () => {
      const youthPolicy = {
        bizId: 'R2024002',
        polyBizSjnm: '청년 주거 지원',
        polyItcnCn: '청년 주거 비용 지원',
        cnsgNmor: '부산광역시',
        polyRlmCd: '023020',
        rqutPrdCn: '상시모집',
        rqutUrla: 'https://example.com/apply',
        rfcSiteUrla1: 'https://example.com/detail',
      };

      const result = mapToPolicy(youthPolicy);

      expect(result.isAlwaysOpen).toBe(true);
      expect(result.startDate).toBeNull();
      expect(result.endDate).toBeNull();
    });

    it('should use default category for unknown types', () => {
      const youthPolicy = {
        bizId: 'R2024003',
        polyBizSjnm: '테스트 정책',
        polyItcnCn: '테스트 정책입니다.',
        cnsgNmor: '서울시',
        polyRlmCd: '999999', // 알 수 없는 카테고리
        rqutPrdCn: '2024.01.01~2024.12.31',
        rqutUrla: 'https://example.com/apply',
        rfcSiteUrla1: 'https://example.com/detail',
      };

      const result = mapToPolicy(youthPolicy);

      expect(result.category).toBe('WELFARE'); // 기본값
    });

    it('should use ALL region for unknown regions', () => {
      const youthPolicy = {
        bizId: 'R2024004',
        polyBizSjnm: '테스트 정책',
        polyItcnCn: '테스트 정책입니다.',
        cnsgNmor: '알 수 없는 지역',
        polyRlmCd: '023010',
        rqutPrdCn: '2024.01.01~2024.12.31',
        rqutUrla: 'https://example.com/apply',
        rfcSiteUrla1: 'https://example.com/detail',
      };

      const result = mapToPolicy(youthPolicy);

      expect(result.region).toBe('ALL'); // 기본값
    });

    it('should handle missing optional fields', () => {
      const youthPolicy = {
        bizId: 'R2024005',
        polyBizSjnm: '최소 정보 정책',
        polyItcnCn: '',
        cnsgNmor: '서울시',
        polyRlmCd: '023010',
        rqutPrdCn: '',
        rqutUrla: '',
        rfcSiteUrla1: '',
      };

      const result = mapToPolicy(youthPolicy);

      expect(result.id).toBe('R2024005');
      expect(result.title).toBe('최소 정보 정책');
      expect(result.summary).toBeNull();
      expect(result.applyUrl).toBeNull();
    });
  });
});
