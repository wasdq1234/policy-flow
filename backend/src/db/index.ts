import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

/**
 * Cloudflare D1 데이터베이스 연결 생성
 * @param d1 - Cloudflare Workers의 D1Database 바인딩
 * @returns Drizzle ORM 인스턴스
 */
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof createDb>;

// 스키마 재export (편의성)
export * from './schema';
