/**
 * 북마크 서비스
 * 북마크 목록 조회, 생성, 삭제
 */
import type { D1Database } from '@cloudflare/workers-types';
import type { BookmarkListItem } from '../../../contracts/bookmarks.contract';
import type { CreateBookmarkResponse } from '../../../contracts/bookmarks.contract';
import { calculatePolicyStatus } from '../utils/policy-status';
import { NotFoundError, ConflictError } from '../middleware/error-handler';

/**
 * 북마크 목록 조회 (페이지네이션 + 정책 정보 포함)
 */
export async function getBookmarks(
  db: D1Database,
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: BookmarkListItem[]; total: number }> {
  // 전체 개수 조회
  const countQuery = `
    SELECT COUNT(*) as count
    FROM bookmarks
    WHERE user_id = ?
  `;
  const countResult = await db.prepare(countQuery).bind(userId).first<{ count: number }>();
  const total = countResult?.count || 0;

  // 페이지네이션 계산
  const offset = (page - 1) * limit;

  // 북마크 + 정책 정보 JOIN 조회
  const dataQuery = `
    SELECT
      b.user_id,
      b.policy_id,
      b.notify_before_days,
      b.created_at as bookmark_created_at,
      p.id as policy_id,
      p.title,
      p.summary,
      p.category,
      p.region,
      p.start_date,
      p.end_date,
      p.is_always_open
    FROM bookmarks b
    INNER JOIN policies p ON b.policy_id = p.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const dataResult = await db
    .prepare(dataQuery)
    .bind(userId, limit, offset)
    .all<any>();

  // 결과를 BookmarkListItem으로 변환
  const data: BookmarkListItem[] = (dataResult.results || []).map((row) => {
    const startDate = row.start_date || null;
    const endDate = row.end_date || null;
    const isAlwaysOpen = Boolean(row.is_always_open);

    return {
      policyId: row.policy_id,
      policy: {
        id: row.policy_id,
        title: row.title,
        summary: row.summary,
        category: row.category as any,
        region: row.region as any,
        status: calculatePolicyStatus(startDate, endDate, isAlwaysOpen),
        startDate,
        endDate,
        isAlwaysOpen,
      },
      notifyBeforeDays: row.notify_before_days,
      createdAt: row.bookmark_created_at,
    };
  });

  return { data, total };
}

/**
 * 북마크 생성
 */
export async function createBookmark(
  db: D1Database,
  userId: string,
  policyId: string,
  notifyBeforeDays: number = 3
): Promise<CreateBookmarkResponse> {
  // 1. 정책 존재 여부 확인
  const policyCheckQuery = `SELECT id FROM policies WHERE id = ? LIMIT 1`;
  const policyExists = await db.prepare(policyCheckQuery).bind(policyId).first();

  if (!policyExists) {
    throw new NotFoundError('요청한 정책을 찾을 수 없습니다.');
  }

  // 2. 중복 북마크 확인
  const existingBookmarkQuery = `
    SELECT user_id, policy_id
    FROM bookmarks
    WHERE user_id = ? AND policy_id = ?
    LIMIT 1
  `;
  const existingBookmark = await db
    .prepare(existingBookmarkQuery)
    .bind(userId, policyId)
    .first();

  if (existingBookmark) {
    // 이미 존재하면 현재 북마크 정보 반환 (중복 생성 방지)
    const currentBookmarkQuery = `
      SELECT created_at, notify_before_days
      FROM bookmarks
      WHERE user_id = ? AND policy_id = ?
      LIMIT 1
    `;
    const current = await db
      .prepare(currentBookmarkQuery)
      .bind(userId, policyId)
      .first<any>();

    return {
      policyId,
      notifyBeforeDays: current?.notify_before_days || 3,
      createdAt: current?.created_at || Math.floor(Date.now() / 1000),
    };
  }

  // 3. 북마크 생성
  const now = Math.floor(Date.now() / 1000);
  const insertQuery = `
    INSERT INTO bookmarks (user_id, policy_id, notify_before_days, created_at)
    VALUES (?, ?, ?, ?)
  `;

  await db.prepare(insertQuery).bind(userId, policyId, notifyBeforeDays, now).run();

  return {
    policyId,
    notifyBeforeDays,
    createdAt: now,
  };
}

/**
 * 북마크 삭제
 */
export async function deleteBookmark(
  db: D1Database,
  userId: string,
  policyId: string
): Promise<void> {
  // 1. 북마크 존재 여부 확인
  const checkQuery = `
    SELECT user_id, policy_id
    FROM bookmarks
    WHERE user_id = ? AND policy_id = ?
    LIMIT 1
  `;
  const bookmark = await db.prepare(checkQuery).bind(userId, policyId).first();

  if (!bookmark) {
    throw new NotFoundError('요청한 북마크를 찾을 수 없습니다.');
  }

  // 2. 북마크 삭제
  const deleteQuery = `
    DELETE FROM bookmarks
    WHERE user_id = ? AND policy_id = ?
  `;
  await db.prepare(deleteQuery).bind(userId, policyId).run();
}
