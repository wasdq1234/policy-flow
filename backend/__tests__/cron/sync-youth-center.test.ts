/**
 * 청년센터 API 동기화 Cron 테스트 (TDD RED)
 * Phase 5, T5.1 - 청년센터 API 연동
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockEnv } from '../utils/test-helpers';
import { syncYouthCenterPolicies } from '@/cron/sync-youth-center';
import * as youthCenterApi from '@/services/youth-center-api.service';

// Mock fetch
global.fetch = vi.fn();

describe('sync-youth-center Cron', () => {
  let mockEnv: any;
  const now = Math.floor(Date.now() / 1000);

  beforeEach(() => {
    mockEnv = createMockEnv();
    vi.clearAllMocks();

    // API 환경 변수 설정
    mockEnv.YOUTH_CENTER_API_KEY = 'test-api-key';
  });

  describe('syncYouthCenterPolicies', () => {
    it('should fetch and save policies from API', async () => {
      // Mock API 응답
      const mockApiResponse = {
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

      vi.spyOn(youthCenterApi, 'fetchYouthCenterPolicies').mockResolvedValueOnce(
        mockApiResponse
      );

      const result = await syncYouthCenterPolicies(mockEnv);

      expect(result.success).toBe(true);
      expect(result.inserted).toBe(2);
      expect(result.updated).toBe(0);
      expect(result.total).toBe(2);

      // DB에 저장되었는지 확인
      const policies = mockEnv.DB.data.get('policies');
      expect(policies.length).toBe(2);
      expect(policies[0].id).toBe('R2024001');
      expect(policies[0].title).toBe('청년 일자리 지원');
      expect(policies[0].category).toBe('JOB');
      expect(policies[0].region).toBe('SEOUL');
      expect(policies[1].id).toBe('R2024002');
      expect(policies[1].is_always_open).toBe(1);
    });

    it.skip('should update existing policies', async () => {
      // 기존 정책 추가
      mockEnv.DB.data.set('policies', [
        {
          id: 'R2024001',
          title: '청년 일자리 지원 (구버전)',
          summary: '구버전 요약',
          category: 'JOB',
          region: 'SEOUL',
          target_age_min: null,
          target_age_max: null,
          start_date: null,
          end_date: null,
          is_always_open: 0,
          apply_url: null,
          detail_json: null,
          created_at: now - 3600,
          updated_at: now - 3600,
        },
      ]);

      // Mock API 응답 (업데이트된 정책)
      const mockApiResponse = {
        pageIndex: 1,
        totalCnt: 1,
        youthPolicyList: [
          {
            bizId: 'R2024001',
            polyBizSjnm: '청년 일자리 지원 (신버전)',
            polyItcnCn: '신버전 요약',
            cnsgNmor: '서울시',
            polyRlmCd: '023010',
            rqutPrdCn: '2024.01.01~2024.12.31',
            rqutUrla: 'https://example.com/apply',
            rfcSiteUrla1: 'https://example.com/detail',
          },
        ],
      };

      vi.spyOn(youthCenterApi, 'fetchYouthCenterPolicies').mockResolvedValueOnce(
        mockApiResponse
      );

      const result = await syncYouthCenterPolicies(mockEnv);

      expect(result.success).toBe(true);
      expect(result.inserted).toBe(0);
      expect(result.updated).toBe(1);
      expect(result.total).toBe(1);

      // DB에 업데이트되었는지 확인
      const policies = mockEnv.DB.data.get('policies');
      expect(policies.length).toBe(1);
      expect(policies[0].title).toBe('청년 일자리 지원 (신버전)');
      expect(policies[0].summary).toBe('신버전 요약');
    });

    it('should handle pagination (multiple pages)', async () => {
      // Page 1 응답
      const mockApiResponse1 = {
        pageIndex: 1,
        totalCnt: 150, // 총 150개 (2페이지 필요, display=100 기준)
        youthPolicyList: new Array(100).fill(null).map((_, i) => ({
          bizId: `R2024${String(i + 1).padStart(3, '0')}`,
          polyBizSjnm: `정책 ${i + 1}`,
          polyItcnCn: `정책 ${i + 1} 요약`,
          cnsgNmor: '서울시',
          polyRlmCd: '023010',
          rqutPrdCn: '2024.01.01~2024.12.31',
          rqutUrla: 'https://example.com/apply',
          rfcSiteUrla1: 'https://example.com/detail',
        })),
      };

      // Page 2 응답
      const mockApiResponse2 = {
        pageIndex: 2,
        totalCnt: 150,
        youthPolicyList: new Array(50).fill(null).map((_, i) => ({
          bizId: `R2024${String(i + 101).padStart(3, '0')}`,
          polyBizSjnm: `정책 ${i + 101}`,
          polyItcnCn: `정책 ${i + 101} 요약`,
          cnsgNmor: '서울시',
          polyRlmCd: '023010',
          rqutPrdCn: '2024.01.01~2024.12.31',
          rqutUrla: 'https://example.com/apply',
          rfcSiteUrla1: 'https://example.com/detail',
        })),
      };

      const fetchSpy = vi
        .spyOn(youthCenterApi, 'fetchYouthCenterPolicies')
        .mockResolvedValueOnce(mockApiResponse1)
        .mockResolvedValueOnce(mockApiResponse2);

      const result = await syncYouthCenterPolicies(mockEnv);

      expect(result.success).toBe(true);
      expect(result.total).toBe(150);
      expect(result.inserted).toBe(150);

      // API가 2번 호출되었는지 확인
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(fetchSpy).toHaveBeenNthCalledWith(1, {
        apiKey: 'test-api-key',
        pageIndex: 1,
        display: 100,
      });
      expect(fetchSpy).toHaveBeenNthCalledWith(2, {
        apiKey: 'test-api-key',
        pageIndex: 2,
        display: 100,
      });

      // DB에 모든 정책이 저장되었는지 확인
      const policies = mockEnv.DB.data.get('policies');
      expect(policies.length).toBe(150);
    });

    it('should handle API errors gracefully', async () => {
      vi.spyOn(youthCenterApi, 'fetchYouthCenterPolicies').mockRejectedValueOnce(
        new Error('API 호출 실패')
      );

      const result = await syncYouthCenterPolicies(mockEnv);

      expect(result.success).toBe(false);
      expect(result.error).toContain('API 호출 실패');
      expect(result.inserted).toBe(0);
      expect(result.updated).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should throw error when API key is missing', async () => {
      delete mockEnv.YOUTH_CENTER_API_KEY;

      await expect(syncYouthCenterPolicies(mockEnv)).rejects.toThrow(
        '청년센터 API 키가 설정되지 않았습니다'
      );
    });

    it('should handle empty response', async () => {
      const mockApiResponse = {
        pageIndex: 1,
        totalCnt: 0,
        youthPolicyList: [],
      };

      vi.spyOn(youthCenterApi, 'fetchYouthCenterPolicies').mockResolvedValueOnce(
        mockApiResponse
      );

      const result = await syncYouthCenterPolicies(mockEnv);

      expect(result.success).toBe(true);
      expect(result.total).toBe(0);
      expect(result.inserted).toBe(0);
      expect(result.updated).toBe(0);
    });

    it('should continue on single policy error (resilient)', async () => {
      // Mock API 응답 (일부 정책은 유효하지 않을 수 있음)
      const mockApiResponse = {
        pageIndex: 1,
        totalCnt: 3,
        youthPolicyList: [
          {
            bizId: 'R2024001',
            polyBizSjnm: '유효한 정책',
            polyItcnCn: '유효한 정책 요약',
            cnsgNmor: '서울시',
            polyRlmCd: '023010',
            rqutPrdCn: '2024.01.01~2024.12.31',
            rqutUrla: 'https://example.com/apply',
            rfcSiteUrla1: 'https://example.com/detail',
          },
          {
            // 필수 필드 누락 (bizId)
            bizId: '',
            polyBizSjnm: '잘못된 정책',
            polyItcnCn: '잘못된 정책 요약',
            cnsgNmor: '서울시',
            polyRlmCd: '023010',
            rqutPrdCn: '2024.01.01~2024.12.31',
            rqutUrla: 'https://example.com/apply',
            rfcSiteUrla1: 'https://example.com/detail',
          },
          {
            bizId: 'R2024003',
            polyBizSjnm: '또 다른 유효한 정책',
            polyItcnCn: '또 다른 유효한 정책 요약',
            cnsgNmor: '부산광역시',
            polyRlmCd: '023020',
            rqutPrdCn: '상시모집',
            rqutUrla: 'https://example.com/apply',
            rfcSiteUrla1: 'https://example.com/detail',
          },
        ],
      };

      vi.spyOn(youthCenterApi, 'fetchYouthCenterPolicies').mockResolvedValueOnce(
        mockApiResponse
      );

      const result = await syncYouthCenterPolicies(mockEnv);

      // 유효한 정책 2개는 저장됨
      expect(result.success).toBe(true);
      expect(result.total).toBe(3);
      expect(result.inserted).toBe(2); // 유효한 정책 2개만
      expect(result.errors).toBe(1); // 잘못된 정책 1개

      // DB에 유효한 정책만 저장되었는지 확인
      const policies = mockEnv.DB.data.get('policies');
      expect(policies.length).toBe(2);
      expect(policies.map((p: any) => p.id).sort()).toEqual(['R2024001', 'R2024003']);
    });
  });
});
