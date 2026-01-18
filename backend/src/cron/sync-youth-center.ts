/**
 * Cron Trigger: 청년센터 API 동기화
 * 매일 실행하여 정책 데이터를 최신 상태로 유지
 */
import type { D1Database } from '@cloudflare/workers-types';
import {
  fetchYouthCenterPolicies,
  mapToPolicy,
  type YouthCenterResponse,
} from '../services/youth-center-api.service';

/**
 * 동기화 결과
 */
export interface SyncResult {
  success: boolean;
  total: number;
  inserted: number;
  updated: number;
  errors: number;
  error?: string;
}

/**
 * 환경 변수 (Cloudflare Workers Env)
 */
export interface SyncEnv {
  DB: D1Database;
  YOUTH_CENTER_API_KEY?: string;
}

/**
 * 청년센터 API 동기화 실행
 * @param env - Cloudflare Workers 환경 변수
 * @returns 동기화 결과
 */
export async function syncYouthCenterPolicies(
  env: SyncEnv
): Promise<SyncResult> {
  console.log('[Sync] 청년센터 API 동기화 시작...');

  const apiKey = env.YOUTH_CENTER_API_KEY;

  if (!apiKey) {
    throw new Error('청년센터 API 키가 설정되지 않았습니다 (YOUTH_CENTER_API_KEY)');
  }

  const db = env.DB;

  let totalCount = 0;
  let insertedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  try {
    // 페이지네이션 처리
    const display = 100; // 한 페이지당 100개씩 (API 최대값)
    let pageIndex = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`[Sync] 페이지 ${pageIndex} 조회 중...`);

      let response: YouthCenterResponse;
      try {
        response = await fetchYouthCenterPolicies({
          apiKey,
          pageIndex,
          display,
        });
      } catch (error) {
        console.error(`[Sync] API 호출 실패:`, error);
        return {
          success: false,
          total: 0,
          inserted: 0,
          updated: 0,
          errors: 0,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
        };
      }

      const youthPolicies = response.youthPolicyList || [];
      totalCount += youthPolicies.length;

      console.log(
        `[Sync] ${youthPolicies.length}개 정책 조회 (전체 ${response.totalCnt}개 중 ${totalCount}개)`
      );

      // 각 정책을 DB에 Upsert
      for (const youthPolicy of youthPolicies) {
        try {
          // 유효성 검사
          if (!youthPolicy.bizId || !youthPolicy.polyBizSjnm) {
            console.warn(
              `[Sync] 유효하지 않은 정책 스킵: ${JSON.stringify(youthPolicy)}`
            );
            errorCount++;
            continue;
          }

          const policy = mapToPolicy(youthPolicy);

          // Upsert: 기존 정책 존재 여부 확인 (Raw SQL)
          const existingPolicy = await db
            .prepare('SELECT id FROM policies WHERE id = ?')
            .bind(policy.id)
            .first();

          if (existingPolicy) {
            // UPDATE (Raw SQL)
            const startDate = policy.startDate ? Math.floor(policy.startDate.getTime() / 1000) : null;
            const endDate = policy.endDate ? Math.floor(policy.endDate.getTime() / 1000) : null;
            const createdAt = Math.floor(policy.createdAt.getTime() / 1000);
            const updatedAt = Math.floor(policy.updatedAt.getTime() / 1000);

            await db
              .prepare(`
                UPDATE policies
                SET title = ?,
                    summary = ?,
                    category = ?,
                    region = ?,
                    start_date = ?,
                    end_date = ?,
                    is_always_open = ?,
                    apply_url = ?,
                    detail_json = ?,
                    updated_at = ?
                WHERE id = ?
              `)
              .bind(
                policy.title,
                policy.summary,
                policy.category,
                policy.region,
                startDate,
                endDate,
                policy.isAlwaysOpen ? 1 : 0,
                policy.applyUrl,
                policy.detailJson,
                updatedAt,
                policy.id
              )
              .run();

            updatedCount++;
          } else {
            // INSERT (Raw SQL)
            const startDate = policy.startDate ? Math.floor(policy.startDate.getTime() / 1000) : null;
            const endDate = policy.endDate ? Math.floor(policy.endDate.getTime() / 1000) : null;
            const createdAt = Math.floor(policy.createdAt.getTime() / 1000);
            const updatedAt = Math.floor(policy.updatedAt.getTime() / 1000);

            await db
              .prepare(`
                INSERT INTO policies (
                  id, title, summary, category, region,
                  target_age_min, target_age_max, start_date, end_date, is_always_open,
                  apply_url, detail_json, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `)
              .bind(
                policy.id,
                policy.title,
                policy.summary,
                policy.category,
                policy.region,
                policy.targetAgeMin,
                policy.targetAgeMax,
                startDate,
                endDate,
                policy.isAlwaysOpen ? 1 : 0,
                policy.applyUrl,
                policy.detailJson,
                createdAt,
                updatedAt
              )
              .run();

            insertedCount++;
          }
        } catch (error) {
          console.error(`[Sync] 정책 저장 실패 (${youthPolicy.bizId}):`, error);
          errorCount++;
        }
      }

      // 다음 페이지 확인
      const fetchedCount = pageIndex * display;
      if (fetchedCount >= response.totalCnt || youthPolicies.length === 0) {
        hasMore = false;
      } else {
        pageIndex++;
      }
    }

    console.log(
      `[Sync] 동기화 완료: 전체 ${totalCount}개, 추가 ${insertedCount}개, 업데이트 ${updatedCount}개, 오류 ${errorCount}개`
    );

    return {
      success: true,
      total: totalCount,
      inserted: insertedCount,
      updated: updatedCount,
      errors: errorCount,
    };
  } catch (error) {
    console.error('[Sync] 동기화 중 오류 발생:', error);
    return {
      success: false,
      total: totalCount,
      inserted: insertedCount,
      updated: updatedCount,
      errors: errorCount,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}
