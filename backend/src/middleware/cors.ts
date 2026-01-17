/**
 * CORS 미들웨어 설정
 * TRD 섹션 8.2 준수
 */
import { cors } from 'hono/cors';

export const corsMiddleware = cors({
  origin: [
    'http://localhost:3000',
    'https://policyflow.pages.dev',
    'https://policyflow.kr',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['X-Request-Id'],
  maxAge: 86400,
  credentials: true,
});
