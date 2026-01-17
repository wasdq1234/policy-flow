/**
 * 정책 서비스
 * 정책 목록 조회, 상세 조회, 필터링
 */
import type { D1Database } from '@cloudflare/workers-types';
import type { PolicyListItem, PolicyDetail, GetPoliciesQuery } from '../../../contracts/schemas/policies';
import type { PolicyStatus } from '../../../contracts/types';
import { calculatePolicyStatus } from '../utils/policy-status';

/**
 * 정책 목록 조회 (필터링 + 페이지네이션)
 */
export async function getPolicies(
  db: D1Database,
  query: GetPoliciesQuery
): Promise<{ data: PolicyListItem[]; total: number }> {
  // WHERE 조건 구성
  const whereClauses: string[] = [];
  const params: any[] = [];

  if (query.region) {
    whereClauses.push('region = ?');
    params.push(query.region);
  }

  if (query.category) {
    whereClauses.push('category = ?');
    params.push(query.category);
  }

  if (query.search) {
    whereClauses.push('(title LIKE ? OR summary LIKE ?)');
    const searchPattern = `%${query.search}%`;
    params.push(searchPattern, searchPattern);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // 전체 개수 조회
  const countQuery = `SELECT COUNT(*) as count FROM policies ${whereClause}`;
  const countResult = await db.prepare(countQuery).bind(...params).first<{ count: number }>();
  const total = countResult?.count || 0;

  // 페이지네이션 계산
  const offset = (query.page - 1) * query.limit;

  // 데이터 조회
  const dataQuery = `
    SELECT
      id, title, summary, category, region,
      start_date, end_date, is_always_open
    FROM policies
    ${whereClause}
    ORDER BY updated_at DESC
    LIMIT ? OFFSET ?
  `;

  const dataResult = await db
    .prepare(dataQuery)
    .bind(...params, query.limit, offset)
    .all<any>();

  // DB 결과를 PolicyListItem으로 변환 (status 계산 포함)
  let data: PolicyListItem[] = (dataResult.results || []).map((row) => {
    const startDate = row.start_date || null;
    const endDate = row.end_date || null;
    const isAlwaysOpen = Boolean(row.is_always_open);

    return {
      id: row.id,
      title: row.title,
      summary: row.summary,
      category: row.category as any,
      region: row.region as any,
      status: calculatePolicyStatus(startDate, endDate, isAlwaysOpen),
      startDate,
      endDate,
      isAlwaysOpen,
    };
  });

  // status 필터링 (클라이언트에서 요청한 경우)
  if (query.status) {
    data = data.filter((policy) => policy.status === query.status);
  }

  return { data, total };
}

/**
 * 정책 상세 조회
 */
export async function getPolicyById(
  db: D1Database,
  policyId: string
): Promise<PolicyDetail | null> {
  const query = `
    SELECT
      id, title, summary, category, region,
      start_date, end_date, is_always_open,
      apply_url, target_age_min, target_age_max,
      detail_json, created_at, updated_at
    FROM policies
    WHERE id = ?
    LIMIT 1
  `;

  const result = await db.prepare(query).bind(policyId).first<any>();

  if (!result) {
    return null;
  }

  const startDate = result.start_date || null;
  const endDate = result.end_date || null;
  const isAlwaysOpen = Boolean(result.is_always_open);
  const createdAt = result.created_at || 0;
  const updatedAt = result.updated_at || 0;

  return {
    id: result.id,
    title: result.title,
    summary: result.summary,
    category: result.category as any,
    region: result.region as any,
    status: calculatePolicyStatus(startDate, endDate, isAlwaysOpen),
    startDate,
    endDate,
    isAlwaysOpen,
    applyUrl: result.apply_url,
    targetAgeMin: result.target_age_min,
    targetAgeMax: result.target_age_max,
    detailJson: result.detail_json,
    createdAt,
    updatedAt,
  };
}
