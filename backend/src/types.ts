/**
 * Cloudflare Workers 환경 바인딩 타입 정의
 */
export type Bindings = {
  DB: D1Database;
  ENVIRONMENT: string;
};

/**
 * Hono 컨텍스트에서 사용할 환경 타입
 */
export type Env = {
  Bindings: Bindings;
};
