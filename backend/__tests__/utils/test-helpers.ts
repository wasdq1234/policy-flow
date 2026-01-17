/**
 * 테스트 유틸리티 함수 모음
 * HTTP 요청 테스트, Mock 생성 등
 */
import app from '@/index';
import type { D1Database } from '@cloudflare/workers-types';

// 인메모리 데이터 저장소
const inMemoryStore = new Map<string, any[]>();

/**
 * 테스트 데이터 초기화 (각 테스트 간 격리)
 */
export function clearInMemoryStore() {
  inMemoryStore.clear();
}

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
    inMemoryStore.set('post_likes', []);
    inMemoryStore.set('comment_likes', []);
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
            // JOIN 처리
            if (q.includes('join')) {
              const users = [...(inMemoryStore.get('users') || [])];
              const bookmarks = [...(inMemoryStore.get('bookmarks') || [])];
              const policies = [...(inMemoryStore.get('policies') || [])];

              // 1. users + bookmarks JOIN (notification용)
              if (q.includes('users') && q.includes('bookmarks')) {
                let filteredBookmarks = bookmarks;

                // WHERE policy_id = ? 필터링
                if (q.includes('policy_id')) {
                  const policyId = params[0];
                  filteredBookmarks = bookmarks.filter((b: any) => b.policy_id === policyId);
                }

                // JOIN 수행 (users + bookmarks)
                const joinedResults = filteredBookmarks
                  .map((b: any) => {
                    const user = users.find((u: any) => u.id === b.user_id);
                    if (!user) return null;

                    // fcm_token IS NOT NULL AND fcm_token != ''
                    if (!user.fcm_token || user.fcm_token === '') return null;

                    return {
                      id: user.id,
                      email: user.email,
                      nickname: user.nickname,
                      fcm_token: user.fcm_token,
                    };
                  })
                  .filter(Boolean);

                return { results: joinedResults, success: true };
              }

              // 2. bookmarks + policies JOIN
              // user_id 필터링
              let filteredBookmarks = bookmarks;
              if (q.includes('where') && q.includes('user_id')) {
                const userId = params[0];
                filteredBookmarks = bookmarks.filter((b: any) => b.user_id === userId);
              }

              // JOIN 수행
              const joinedResults = filteredBookmarks.map((b: any) => {
                const policy = policies.find((p: any) => p.id === b.policy_id);
                if (!policy) return null;

                return {
                  user_id: b.user_id,
                  policy_id: b.policy_id,
                  notify_before_days: b.notify_before_days,
                  bookmark_created_at: b.created_at,
                  title: policy.title,
                  summary: policy.summary,
                  category: policy.category,
                  region: policy.region,
                  start_date: policy.start_date,
                  end_date: policy.end_date,
                  is_always_open: policy.is_always_open,
                };
              }).filter(Boolean);

              // ORDER BY created_at DESC
              joinedResults.sort((a: any, b: any) => b.bookmark_created_at - a.bookmark_created_at);

              // LIMIT & OFFSET 처리
              let offset = 0;
              let limit = joinedResults.length;

              const limitOffsetParams = params.slice(1); // user_id 다음 파라미터들
              if (q.includes('limit') && q.includes('offset')) {
                limit = limitOffsetParams[0] || limit;
                offset = limitOffsetParams[1] || 0;
              } else if (q.includes('limit')) {
                limit = limitOffsetParams[0] || limit;
              }

              const paginatedResults = joinedResults.slice(offset, offset + limit);

              return { results: paginatedResults, success: true };
            }

            const match = query.match(/from\s+["']?(\w+)["']?/i);
            if (!match) return { results: [], success: true };

            const tableName = match[1];
            let results = [...(inMemoryStore.get(tableName) || [])];

            // policies 테이블의 복잡한 WHERE 절 처리 (notification용 날짜 범위 쿼리)
            if (tableName === 'policies' && q.includes('where') && q.includes('is_always_open') && q.includes('end_date')) {
              // is_always_open = 0
              results = results.filter((r: any) => r.is_always_open === 0);

              // end_date IS NOT NULL
              results = results.filter((r: any) => r.end_date !== null && r.end_date !== undefined);

              // end_date > ? AND end_date <= ? (날짜 범위)
              if (q.includes('end_date >') && q.includes('end_date <=')) {
                const minDate = params[0];
                const maxDate = params[1];
                results = results.filter((r: any) => {
                  const endDate = r.end_date;
                  return endDate !== null && endDate > minDate && endDate <= maxDate;
                });
              }

              // ORDER BY end_date ASC
              if (q.includes('order by end_date asc')) {
                results.sort((a: any, b: any) => (a.end_date || 0) - (b.end_date || 0));
              }

              return { results, success: true };
            }

            // COUNT(*) 특별 처리
            if (q.includes('count(*)')) {
              // WHERE 절 먼저 적용
              if (q.includes('where')) {
                let paramIndex = 0;

                if (q.includes('post_id =')) {
                  const postId = params[paramIndex++];
                  results = results.filter((r: any) => r.post_id === postId);
                }

                if (q.includes('user_id')) {
                  const userId = params[paramIndex++];
                  results = results.filter((r: any) => r.user_id === userId);
                }

                if (q.includes('region =') || q.includes('region=')) {
                  const region = params[paramIndex++];
                  results = results.filter((r: any) => r.region === region);
                }

                if (q.includes('category =') || q.includes('category=')) {
                  const category = params[paramIndex++];
                  results = results.filter((r: any) => r.category === category);
                }

                if (q.includes('like')) {
                  const likePatterns = params.filter((p: any) => typeof p === 'string' && p.includes('%'));
                  likePatterns.forEach((pattern: string) => {
                    const searchTerm = pattern.replace(/%/g, '').toLowerCase();
                    results = results.filter((r: any) => {
                      const title = (r.title || '').toLowerCase();
                      const summary = (r.summary || '').toLowerCase();
                      return title.includes(searchTerm) || summary.includes(searchTerm);
                    });
                  });
                }

                // is_deleted 필터
                if (q.includes('is_deleted')) {
                  results = results.filter((r: any) => r.is_deleted === 0);
                }
              }

              // COUNT 결과 반환
              return { results: [{ count: results.length }], success: true };
            }

            // WHERE 절에 사용된 파라미터 수를 계산
            let whereParamCount = 0;

            // WHERE 절 처리 (간단한 파서)
            if (q.includes('where')) {
              let paramIndex = 0;

              // user_id + policy_id 복합 조건 (북마크) - 정확한 매칭
              if (tableName === 'bookmarks' && q.includes('user_id') && q.includes('policy_id')) {
                const userId = params[paramIndex++];
                const policyId = params[paramIndex++];
                whereParamCount += 2;
                results = results.filter((r: any) =>
                  r.user_id === userId && r.policy_id === policyId
                );
              }
              // user_id + created_at 복합 조건 (댓글 생성 후 조회) - WHERE 절에 둘 다 있어야 함
              if (q.match(/where.*user_id\s*=.*created_at\s*=/s) || q.match(/where.*created_at\s*=.*user_id\s*=/s)) {
                const userId = params[paramIndex++];
                const createdAt = params[paramIndex++];
                whereParamCount += 2;
                results = results.filter((r: any) =>
                  r.user_id === userId && r.created_at === createdAt
                );
              }
              // user_id + post_id 복합 조건 (좋아요 확인)
              else if (q.includes('user_id') && q.includes('post_id')) {
                const userId = params[paramIndex++];
                const postId = params[paramIndex++];
                whereParamCount += 2;
                results = results.filter((r: any) =>
                  r.user_id === userId && r.post_id === postId
                );
              }
              // user_id + comment_id 복합 조건 (댓글 좋아요 확인)
              else if (q.includes('user_id') && q.includes('comment_id')) {
                const userId = params[paramIndex++];
                const commentId = params[paramIndex++];
                whereParamCount += 2;
                results = results.filter((r: any) =>
                  r.user_id === userId && r.comment_id === commentId
                );
              }
              // user_id + title 복합 조건 (게시글 생성 후 조회)
              else if (q.includes('user_id') && q.includes('title') && !q.includes('policy_id') && !q.includes('post_id')) {
                const userId = params[paramIndex++];
                const title = params[paramIndex++];
                whereParamCount += 2;
                results = results.filter((r: any) => r.user_id === userId && r.title === title);
              }
              // user_id만 있는 경우
              else if (q.includes('user_id') && !q.includes('policy_id') && !q.includes('post_id') && !q.includes('title')) {
                const userId = params[paramIndex++];
                whereParamCount++;
                results = results.filter((r: any) => r.user_id === userId);
              }
              // policy_id만 있는 경우
              else if (q.includes('policy_id') && !q.includes('user_id')) {
                const policyId = params[paramIndex++];
                whereParamCount++;
                results = results.filter((r: any) => r.policy_id === policyId);
              }
              // post_id만 있는 경우 (WHERE 절에서, = 기호로 확인)
              else if (q.includes('where') && q.includes('post_id =') && !q.includes('user_id =') && !q.includes('created_at =') && !q.includes('policy_id =')) {
                const postId = params[paramIndex++];
                whereParamCount++;
                results = results.filter((r: any) => r.post_id === postId);
              }
              // comments 테이블에서 id만 있는 경우 (SELECT ... WHERE id = ?)
              else if (tableName === 'comments' && q.match(/where\s+id\s*=/i) && !q.includes('user_id =') && !q.includes('post_id =')) {
                const id = params[paramIndex++];
                whereParamCount++;
                results = results.filter((r: any) => r.id === id);
              }
              // id 필터 (일반적인 경우, comments 외)
              else if (tableName !== 'comments' && (q.includes('id =') || q.includes('id=')) && !q.includes('user_id') && !q.includes('post_id') && !q.includes('policy_id')) {
                const id = params[paramIndex++];
                whereParamCount++;
                results = results.filter((r: any) => r.id === id);
              }

              // is_deleted 필터 (posts 테이블) - 파라미터 없음
              if (q.includes('is_deleted')) {
                results = results.filter((r: any) => r.is_deleted === 0);
              }

              // post_type 필터
              if (q.includes('post_type')) {
                const postType = params[paramIndex++];
                whereParamCount++;
                results = results.filter((r: any) => r.post_type === postType);
              }

              // provider 필터
              if (q.includes('provider') && !q.includes('user_id')) {
                const provider = params[paramIndex++];
                const providerId = params[paramIndex++];
                whereParamCount += 2;
                results = results.filter((r: any) =>
                  r.provider === provider && (r.providerId === providerId || r.provider_id === providerId)
                );
              }

              // region 필터
              if (q.includes('region =') || q.includes('region=')) {
                const region = params[paramIndex++];
                whereParamCount++;
                results = results.filter((r: any) => r.region === region);
              }

              // category 필터
              if (q.includes('category =') || q.includes('category=')) {
                const category = params[paramIndex++];
                whereParamCount++;
                results = results.filter((r: any) => r.category === category);
              }

              // LIKE 필터 (search)
              if (q.includes('like')) {
                // WHERE 절에 있는 LIKE 패턴만 카운트
                const likeCount = (query.match(/\?/g) || []).length - whereParamCount;
                const likePatterns = params.slice(paramIndex, paramIndex + likeCount).filter((p: any) => typeof p === 'string' && p.includes('%'));
                whereParamCount += likePatterns.length;

                likePatterns.forEach((pattern: string) => {
                  const searchTerm = pattern.replace(/%/g, '').toLowerCase();
                  results = results.filter((r: any) => {
                    const title = (r.title || '').toLowerCase();
                    const summary = (r.summary || '').toLowerCase();
                    return title.includes(searchTerm) || summary.includes(searchTerm);
                  });
                });
              }
            }

            // LIMIT & OFFSET 처리 (WHERE 절 이후의 파라미터 사용)
            let offset = 0;
            let limit = results.length;

            // params 배열에서 LIMIT과 OFFSET 값 추출
            const limitOffsetParams = params.slice(whereParamCount);

            if (q.includes('limit') && q.includes('offset')) {
              // LIMIT ? OFFSET ? 순서
              limit = limitOffsetParams[0] || limit;
              offset = limitOffsetParams[1] || 0;
            } else if (q.includes('limit')) {
              limit = limitOffsetParams[0] || limit;
            } else if (q.includes('offset')) {
              offset = limitOffsetParams[0] || 0;
            }

            // ORDER BY 처리
            if (q.includes('order by')) {
              if (q.includes('created_at desc') || q.includes('created_at  desc')) {
                results.sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0));
              } else if (q.includes('created_at asc')) {
                results.sort((a: any, b: any) => (a.created_at || 0) - (b.created_at || 0));
              }
            }

            // offset과 limit을 함께 적용
            results = results.slice(offset, offset + limit);

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
              const columnsMatch = query.match(/\(([^)]+)\)/);
              if (columnsMatch) {
                const columns = columnsMatch[1].split(',').map(c => c.trim().replace(/["']/g, ''));

                columns.forEach((col, idx) => {
                  values[col] = params[idx];
                });

                // auto_increment ID 생성 (posts, comments 테이블용)
                if ((tableName === 'posts' || tableName === 'comments') && !values.id) {
                  const maxId = table.length > 0
                    ? Math.max(...table.map((r: any) => r.id || 0))
                    : 0;
                  values.id = maxId + 1;
                }

                table.push(values);
                inMemoryStore.set(tableName, table);
              }
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
                      const value = set.split('=')[1]?.trim();

                      // 증가/감소 연산 처리 (view_count + 1, like_count - 1 등)
                      if (value?.includes('+')) {
                        const baseCol = value.split('+')[0].trim().replace(/["']/g, '');
                        const increment = parseInt(value.split('+')[1].trim(), 10);
                        table[i][col] = (table[i][col] || 0) + increment;
                      } else if (value?.includes('-')) {
                        const baseCol = value.split('-')[0].trim().replace(/["']/g, '');
                        const decrement = parseInt(value.split('-')[1].trim(), 10);
                        table[i][col] = Math.max(0, (table[i][col] || 0) - decrement);
                      } else if (value === '?' || value === ' ?') {
                        // 플레이스홀더 - params에서 가져오기
                        table[i][col] = params[paramIdx++];
                      } else {
                        // 리터럴 값 (1, 0, 'string' 등)
                        const literalValue = value.replace(/['"]/g, '');
                        if (!isNaN(Number(literalValue))) {
                          table[i][col] = Number(literalValue);
                        } else {
                          table[i][col] = literalValue;
                        }
                      }
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

              // user_id + policy_id 복합 조건 (북마크)
              if (q.includes('user_id') && q.includes('policy_id')) {
                const userId = params[0];
                const policyId = params[1];
                table = table.filter((r: any) =>
                  !(r.user_id === userId && r.policy_id === policyId)
                );
              }
              // user_id + post_id 복합 조건 (좋아요)
              else if (q.includes('user_id') && q.includes('post_id')) {
                const userId = params[0];
                const postId = params[1];
                table = table.filter((r: any) =>
                  !(r.user_id === userId && r.post_id === postId)
                );
              }
              // user_id + comment_id 복합 조건 (댓글 좋아요)
              else if (q.includes('user_id') && q.includes('comment_id')) {
                const userId = params[0];
                const commentId = params[1];
                table = table.filter((r: any) =>
                  !(r.user_id === userId && r.comment_id === commentId)
                );
              }
              // id만 있는 경우
              else if (q.includes('id')) {
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

        async execute() {
          // Drizzle ORM의 execute() 메서드 지원
          const result = await stmt.all();
          // Drizzle은 results 배열을 직접 반환합니다
          return result.results || [];
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
