import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Type definition for Cloudflare Workers environment
type Bindings = {
  // DB: D1Database; // Will be added in T0.2
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'https://policyflow.pages.dev'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    environment: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString(),
  });
});

// API v1 routes (placeholder)
const api = new Hono<{ Bindings: Bindings }>();

api.get('/', (c) => {
  return c.json({
    message: 'PolicyFlow API v1',
    version: '1.0.0',
  });
});

app.route('/api/v1', api);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
      },
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    500
  );
});

export default app;
