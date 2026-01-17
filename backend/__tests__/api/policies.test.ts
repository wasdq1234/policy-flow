/**
 * 정책 API 테스트 (TDD RED)
 * Phase 2, T2.1 - 정책 API (목록/상세)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testRequest, createMockEnv } from '../utils/test-helpers';

describe('Policies API', () => {
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = createMockEnv();

    // 테스트용 정책 데이터 추가
    const policies = mockEnv.DB.data.get('policies');

    // 현재 시간 기준 타임스탬프
    const now = Math.floor(Date.now() / 1000);
    const oneDaySeconds = 86400;

    mockEnv.DB.data.set('policies', [
      {
        id: 'POL001',
        title: '청년 일자리 지원 사업',
        summary: '만 18세~34세 청년 대상 취업 지원',
        category: 'JOB',
        region: 'SEOUL',
        target_age_min: 18,
        target_age_max: 34,
        start_date: now - 30 * oneDaySeconds, // 30일 전 시작
        end_date: now + 30 * oneDaySeconds, // 30일 후 마감
        is_always_open: 0,
        apply_url: 'https://example.com/apply/POL001',
        detail_json: JSON.stringify({
          content_html: '<p>청년 일자리 지원 상세 내용</p>',
          eligibility: ['만 18세~34세', '서울 거주자'],
          documents: ['신분증', '주민등록등본'],
          contact: '02-1234-5678',
          source_url: 'https://example.com/POL001',
        }),
        created_at: now - 60 * oneDaySeconds,
        updated_at: now - 60 * oneDaySeconds,
      },
      {
        id: 'POL002',
        title: '주거 안정 월세 지원',
        summary: '청년 1인 가구 월세 지원 정책',
        category: 'HOUSING',
        region: 'SEOUL',
        target_age_min: 19,
        target_age_max: 39,
        start_date: now - 60 * oneDaySeconds,
        end_date: now + 5 * oneDaySeconds, // 5일 후 마감 (CLOSING_SOON)
        is_always_open: 0,
        apply_url: 'https://example.com/apply/POL002',
        detail_json: null,
        created_at: now - 90 * oneDaySeconds,
        updated_at: now - 90 * oneDaySeconds,
      },
      {
        id: 'POL003',
        title: '전국 대학생 학자금 대출',
        summary: '저금리 학자금 대출 프로그램',
        category: 'LOAN',
        region: 'ALL',
        target_age_min: null,
        target_age_max: null,
        start_date: null,
        end_date: null,
        is_always_open: 1, // 상시 모집
        apply_url: 'https://example.com/apply/POL003',
        detail_json: null,
        created_at: now - 120 * oneDaySeconds,
        updated_at: now - 120 * oneDaySeconds,
      },
      {
        id: 'POL004',
        title: '부산 청년 창업 지원',
        summary: '부산 지역 청년 창업 자금 지원',
        category: 'STARTUP',
        region: 'BUSAN',
        target_age_min: 20,
        target_age_max: 39,
        start_date: now + 10 * oneDaySeconds, // 10일 후 시작 (UPCOMING)
        end_date: now + 60 * oneDaySeconds,
        is_always_open: 0,
        apply_url: null,
        detail_json: null,
        created_at: now - 30 * oneDaySeconds,
        updated_at: now - 30 * oneDaySeconds,
      },
      {
        id: 'POL005',
        title: '경기도 교육 지원',
        summary: '경기도 청년 교육 비용 지원',
        category: 'EDUCATION',
        region: 'GYEONGGI',
        target_age_min: 18,
        target_age_max: 35,
        start_date: now - 90 * oneDaySeconds,
        end_date: now - 10 * oneDaySeconds, // 10일 전 마감 (CLOSED)
        is_always_open: 0,
        apply_url: 'https://example.com/apply/POL005',
        detail_json: null,
        created_at: now - 120 * oneDaySeconds,
        updated_at: now - 120 * oneDaySeconds,
      },
    ]);
  });

  describe('GET /api/v1/policies', () => {
    it('should return policies list with default pagination', async () => {
      const response = await testRequest('GET', '/api/v1/policies', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.meta).toBeDefined();
      expect(json.meta.page).toBe(1);
      expect(json.meta.limit).toBe(20);
      expect(json.meta.total).toBeGreaterThan(0);
      expect(json.meta.hasNext).toBeDefined();
    });

    it('should return policies with custom pagination', async () => {
      const response = await testRequest('GET', '/api/v1/policies?page=1&limit=2', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.data.length).toBeLessThanOrEqual(2);
      expect(json.meta.page).toBe(1);
      expect(json.meta.limit).toBe(2);
      expect(json.meta.hasNext).toBe(true); // 5개 정책이 있으므로
    });

    it('should filter policies by region', async () => {
      const response = await testRequest('GET', '/api/v1/policies?region=SEOUL', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      json.data.forEach((policy: any) => {
        expect(policy.region).toBe('SEOUL');
      });
      expect(json.data.length).toBe(2); // POL001, POL002
    });

    it('should filter policies by category', async () => {
      const response = await testRequest('GET', '/api/v1/policies?category=JOB', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      json.data.forEach((policy: any) => {
        expect(policy.category).toBe('JOB');
      });
      expect(json.data.length).toBe(1); // POL001
    });

    it('should filter policies by status (OPEN)', async () => {
      const response = await testRequest('GET', '/api/v1/policies?status=OPEN', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      json.data.forEach((policy: any) => {
        expect(['OPEN', 'CLOSING_SOON'].includes(policy.status)).toBe(true);
      });
    });

    it('should filter policies by status (UPCOMING)', async () => {
      const response = await testRequest('GET', '/api/v1/policies?status=UPCOMING', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      json.data.forEach((policy: any) => {
        expect(policy.status).toBe('UPCOMING');
      });
      expect(json.data.length).toBeGreaterThan(0); // POL004
    });

    it('should filter policies by status (CLOSING_SOON)', async () => {
      const response = await testRequest('GET', '/api/v1/policies?status=CLOSING_SOON', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      json.data.forEach((policy: any) => {
        expect(policy.status).toBe('CLOSING_SOON');
      });
      expect(json.data.length).toBeGreaterThan(0); // POL002
    });

    it('should filter policies by status (CLOSED)', async () => {
      const response = await testRequest('GET', '/api/v1/policies?status=CLOSED', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      json.data.forEach((policy: any) => {
        expect(policy.status).toBe('CLOSED');
      });
      expect(json.data.length).toBeGreaterThan(0); // POL005
    });

    it('should combine region and category filters', async () => {
      const response = await testRequest('GET', '/api/v1/policies?region=SEOUL&category=JOB', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      json.data.forEach((policy: any) => {
        expect(policy.region).toBe('SEOUL');
        expect(policy.category).toBe('JOB');
      });
      expect(json.data.length).toBe(1); // POL001
    });

    it('should calculate policy status correctly', async () => {
      const response = await testRequest('GET', '/api/v1/policies', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();

      // POL003 (상시 모집) = OPEN
      const alwaysOpenPolicy = json.data.find((p: any) => p.id === 'POL003');
      expect(alwaysOpenPolicy?.status).toBe('OPEN');

      // POL004 (미래 시작) = UPCOMING
      const upcomingPolicy = json.data.find((p: any) => p.id === 'POL004');
      expect(upcomingPolicy?.status).toBe('UPCOMING');

      // POL005 (과거 종료) = CLOSED
      const closedPolicy = json.data.find((p: any) => p.id === 'POL005');
      expect(closedPolicy?.status).toBe('CLOSED');

      // POL002 (7일 이내 마감) = CLOSING_SOON
      const closingSoonPolicy = json.data.find((p: any) => p.id === 'POL002');
      expect(closingSoonPolicy?.status).toBe('CLOSING_SOON');
    });

    it('should return 400 for invalid region', async () => {
      const response = await testRequest('GET', '/api/v1/policies?region=INVALID', {
        env: mockEnv,
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const response = await testRequest('GET', '/api/v1/policies?category=INVALID', {
        env: mockEnv,
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid status', async () => {
      const response = await testRequest('GET', '/api/v1/policies?status=INVALID', {
        env: mockEnv,
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid page', async () => {
      const response = await testRequest('GET', '/api/v1/policies?page=0', {
        env: mockEnv,
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid limit', async () => {
      const response = await testRequest('GET', '/api/v1/policies?limit=0', {
        env: mockEnv,
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/policies/:id', () => {
    it('should return policy detail by id', async () => {
      const response = await testRequest('GET', '/api/v1/policies/POL001', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data).toBeDefined();
      expect(json.data.id).toBe('POL001');
      expect(json.data.title).toBe('청년 일자리 지원 사업');
      expect(json.data.summary).toBeDefined();
      expect(json.data.category).toBe('JOB');
      expect(json.data.region).toBe('SEOUL');
      expect(json.data.status).toBeDefined();
      expect(json.data.startDate).toBeDefined();
      expect(json.data.endDate).toBeDefined();
      expect(json.data.isAlwaysOpen).toBeDefined();
      expect(json.data.applyUrl).toBeDefined();
      expect(json.data.targetAgeMin).toBeDefined();
      expect(json.data.targetAgeMax).toBeDefined();
      expect(json.data.detailJson).toBeDefined();
      expect(json.data.createdAt).toBeDefined();
      expect(json.data.updatedAt).toBeDefined();
    });

    it('should return 404 for non-existent policy', async () => {
      const response = await testRequest('GET', '/api/v1/policies/INVALID_ID', {
        env: mockEnv,
      });

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should include calculated status in policy detail', async () => {
      const response = await testRequest('GET', '/api/v1/policies/POL003', {
        env: mockEnv,
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.data.status).toBe('OPEN'); // 상시 모집
    });
  });
});
