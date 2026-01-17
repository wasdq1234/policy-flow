/**
 * Mock D1 Database for Testing
 * Drizzle ORM 호환 가능한 Mock DB 구현
 */
import type { D1Database, D1PreparedStatement, D1Result } from '@cloudflare/workers-types';

export class MockD1Database implements D1Database {
  private data: Map<string, any[]> = new Map();

  constructor() {
    // 초기 테이블 생성
    this.data.set('users', []);
    this.data.set('auth_tokens', []);
    this.data.set('policies', []);
    this.data.set('bookmarks', []);
    this.data.set('posts', []);
    this.data.set('comments', []);
  }

  prepare(query: string): D1PreparedStatement {
    const self = this;
    let boundParams: any[] = [];

    const mockStmt: any = {
      bind(...values: any[]): any {
        boundParams = values;
        // bind() 호출 후에도 같은 객체 반환 (체이닝용)
        return {
          ...mockStmt,
          raw: () => ({
            ...mockStmt,
            async all() {
              const result = await mockStmt.all();
              return result.results || [];
            },
          }),
        };
      },

      async first<T = unknown>(colName?: string): Promise<T | null> {
        const result = await mockStmt.all<T>();
        if (result.results && result.results.length > 0) {
          const row = result.results[0];
          if (colName) {
            return (row as any)[colName] || null;
          }
          return row;
        }
        return null;
      },

      async run<T = unknown>(): Promise<D1Result<T>> {
        // INSERT, UPDATE, DELETE 처리
        const queryLower = query.toLowerCase().trim();

        if (queryLower.startsWith('insert')) {
          // INSERT INTO users (...) VALUES (...)
          const match = query.match(/insert\s+into\s+(\w+)/i);
          if (match) {
            const tableName = match[1];
            const table = self.data.get(tableName) || [];

            // VALUES 파라미터 추출 (간단한 구현)
            const values: any = {};
            const columns = query.match(/\(([^)]+)\)/)?.[1].split(',').map(c => c.trim()) || [];
            columns.forEach((col, idx) => {
              values[col] = boundParams[idx];
            });

            table.push(values);
            self.data.set(tableName, table);
          }
          return {
            success: true,
            meta: { rows_written: 1, rows_read: 0, duration: 0 },
            results: [] as T[],
          };
        }

        if (queryLower.startsWith('delete')) {
          // DELETE FROM auth_tokens WHERE user_id = ?
          const match = query.match(/delete\s+from\s+(\w+)/i);
          if (match) {
            const tableName = match[1];
            const table = self.data.get(tableName) || [];

            // 간단한 WHERE 처리 (user_id = ?)
            if (query.includes('user_id')) {
              const userId = boundParams[0];
              const filtered = table.filter((row: any) => row.user_id !== userId && row.userId !== userId);
              self.data.set(tableName, filtered);
            }
          }
          return {
            success: true,
            meta: { rows_written: 0, rows_read: 0, duration: 0 },
            results: [] as T[],
          };
        }

        return {
          success: true,
          meta: { rows_written: 0, rows_read: 0, duration: 0 },
          results: [] as T[],
        };
      },

      async all<T = unknown>(): Promise<D1Result<T>> {
        // SELECT 처리
        const queryLower = query.toLowerCase().trim();

        if (queryLower.startsWith('select')) {
          const match = query.match(/from\s+(\w+)/i);
          if (match) {
            const tableName = match[1];
            let table = self.data.get(tableName) || [];

            // WHERE 조건 간단 처리
            if (query.includes('WHERE') || query.includes('where')) {
              // provider = ? AND provider_id = ?
              if (query.includes('provider') && query.includes('provider_id')) {
                table = table.filter((row: any) =>
                  row.provider === boundParams[0] &&
                  (row.provider_id === boundParams[1] || row.providerId === boundParams[1])
                );
              }
              // refresh_token = ?
              else if (query.includes('refresh_token')) {
                table = table.filter((row: any) =>
                  row.refresh_token === boundParams[0] || row.refreshToken === boundParams[0]
                );
              }
              // user_id = ?
              else if (query.includes('user_id') || query.includes('id =')) {
                table = table.filter((row: any) =>
                  row.user_id === boundParams[0] || row.userId === boundParams[0] || row.id === boundParams[0]
                );
              }
            }

            // LIMIT 처리
            if (query.includes('LIMIT') || query.includes('limit')) {
              const limitMatch = query.match(/limit\s+(\d+)/i);
              if (limitMatch) {
                const limit = parseInt(limitMatch[1], 10);
                table = table.slice(0, limit);
              }
            }

            // Drizzle이 기대하는 형식으로 결과 반환
            const result: D1Result<T> = {
              success: true,
              meta: { rows_written: 0, rows_read: table.length, duration: 0 },
              results: Array.isArray(table) ? table : [],
            };

            return result;
          }
        }

        return {
          success: true,
          meta: { rows_written: 0, rows_read: 0, duration: 0 },
          results: [],
        };
      },

      raw<T = unknown>(options?: any): any {
        // Drizzle ORM이 요구하는 raw() 메서드 구현
        return {
          bind: mockStmt.bind,
          all: mockStmt.all,
          first: mockStmt.first,
          run: mockStmt.run,
          values: async () => {
            const result = await mockStmt.all();
            return result.results || [];
          },
        };
      },
    } as D1PreparedStatement;

    return mockStmt;
  }

  async dump(): Promise<ArrayBuffer> {
    return new ArrayBuffer(0);
  }

  async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    const results: D1Result<T>[] = [];
    for (const stmt of statements) {
      results.push(await stmt.run());
    }
    return results;
  }

  async exec<T = unknown>(query: string): Promise<D1Result<T>> {
    return this.prepare(query).run();
  }
}
