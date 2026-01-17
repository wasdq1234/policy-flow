/**
 * 테스트 유틸리티 함수 모음
 * HTTP 요청 테스트, Mock 생성 등
 */
import app from '@/index';
import type { D1Database } from '@cloudflare/workers-types';

// 인메모리 데이터 저장소
const inMemoryStore = new Map<string, any[]>();

/**
 * 테스트용 앱 인스턴스 생성
 */
export function createTestApp() {
  return app;
}

/**
 * 테스트 요청 헬퍼
 * Hono 앱에 HTTP 요청을 보내고 응답을 반환
 */
export async function testRequest(
  method: string,
  path: string,
  options?: {
    body?: any;
    headers?: Record<string, string>;
    env?: any;
  }
) {
  const testApp = createTestApp();

  const req = new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  // Cloudflare Workers 환경 모킹
  const env = options?.env || createMockEnv();

  return testApp.fetch(req, env);
}

/**
 * Mock Cloudflare Workers 환경 생성
 */
export function createMockEnv() {
  return {
    DB: createMockDb(),
    ENVIRONMENT: 'test',
    JWT_SECRET: 'test-secret-key-for-jwt',
    JWT_ACCESS_EXPIRY: '3600',
    JWT_REFRESH_EXPIRY: '604800',
  };
}

/**
 * Mock D1 Database 생성
 * 간단한 인메모리 구현
 */
export function createMockDb(): D1Database {
  // 테이블 초기화
  if (!inMemoryStore.has('users')) {
    inMemoryStore.set('users', []);
    inMemoryStore.set('auth_tokens', []);
    inMemoryStore.set('policies', []);
    inMemoryStore.set('bookmarks', []);
    inMemoryStore.set('posts', []);
    inMemoryStore.set('comments', []);
  }

  const db: any = {
    data: inMemoryStore, // 테스트에서 접근 가능하도록

    prepare(query: string) {
      let params: any[] = [];

      const stmt = {
        bind(...values: any[]) {
          params = values;
          return stmt; // 체이닝을 위해 자기 자신 반환
        },

        raw() {
          return stmt; // raw()도 자기 자신 반환
        },

        async all() {
          const q = query.toLowerCase();

          if (q.includes('select')) {
            const match = query.match(/from\s+["']?(\w+)["']?/i);
            if (!match) return { results: [], success: true };

            const tableName = match[1];
            let results = [...(inMemoryStore.get(tableName) || [])];

            // WHERE 절 처리
            if (q.includes('where')) {
              if (q.includes('id')) {
                const id = params[params.length - 1];
                results = results.filter((r: any) => r.id === id);
              }
              if (q.includes('provider')) {
                results = results.filter((r: any) =>
                  r.provider === params[0] && (r.providerId === params[1] || r.provider_id === params[1])
                );
              }
            }

            // LIMIT 처리
            if (q.includes('limit')) {
              const limitMatch = query.match(/limit\s+(\d+)/i);
              if (limitMatch) {
                results = results.slice(0, parseInt(limitMatch[1]));
              }
            }

            return { results, success: true };
          }

          return { results: [], success: true };
        },

        async run() {
          const q = query.toLowerCase();

          if (q.includes('insert')) {
            const match = query.match(/insert\s+into\s+["']?(\w+)["']?/i);
            if (match) {
              const tableName = match[1];
              const table = inMemoryStore.get(tableName) || [];

              // 간단한 INSERT 처리 (Drizzle 생성 쿼리 가정)
              const values: any = {};
              const columns = query.match(/\(([^)]+)\)/)?.[1].split(',').map(c => c.trim().replace(/["']/g, '')) || [];

              columns.forEach((col, idx) => {
                values[col] = params[idx];
              });

              table.push(values);
              inMemoryStore.set(tableName, table);
            }
            return { success: true, meta: {} };
          }

          if (q.includes('update')) {
            const match = query.match(/update\s+["']?(\w+)["']?/i);
            if (match) {
              const tableName = match[1];
              const table = inMemoryStore.get(tableName) || [];
              const id = params[params.length - 1];

              for (let i = 0; i < table.length; i++) {
                if (table[i].id === id) {
                  // SET 절 파싱
                  const setMatch = query.match(/set\s+(.+?)\s+where/i);
                  if (setMatch) {
                    const sets = setMatch[1].split(',');
                    let paramIdx = 0;
                    sets.forEach((set: string) => {
                      const col = set.split('=')[0].trim().replace(/["']/g, '');
                      table[i][col] = params[paramIdx++];
                    });
                  }
                  break;
                }
              }

              inMemoryStore.set(tableName, table);
            }
            return { success: true, meta: {} };
          }

          if (q.includes('delete')) {
            const match = query.match(/delete\s+from\s+["']?(\w+)["']?/i);
            if (match) {
              const tableName = match[1];
              let table = inMemoryStore.get(tableName) || [];

              if (q.includes('id')) {
                const id = params[0];
                table = table.filter((r: any) => r.id !== id);
              }

              inMemoryStore.set(tableName, table);
            }
            return { success: true, meta: {} };
          }

          return { success: true, meta: {} };
        },

        async first() {
          const result = await stmt.all();
          return result.results?.[0] || null;
        },
      };

      return stmt;
    },

    async exec(query: string) {
      return this.prepare(query).run();
    },

    async batch(statements: any[]) {
      const results = [];
      for (const stmt of statements) {
        results.push(await stmt.run());
      }
      return results;
    },

    async dump() {
      return new ArrayBuffer(0);
    },
  };

  return db as D1Database;
}

/**
 * Mock 사용자 세션/토큰 생성
 */
export function createMockAuthToken(userId: string = 'test-user-id'): string {
  // 간단한 테스트용 토큰 (실제로는 JWT 등 사용)
  return `mock-token-${userId}`;
}

/**
 * JSON 응답 파싱 헬퍼
 */
export async function parseJsonResponse<T>(response: Response): Promise<T> {
  return await response.json() as T;
}
