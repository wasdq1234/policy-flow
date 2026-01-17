// MSW handlers for auth API endpoints
import { http, HttpResponse } from 'msw';
import type { LoginRequest, LoginResponse, RefreshResponse } from '@policy-flow/contracts';
import { mockLoginResponse } from '../data/users';

export const authHandlers = [
  // POST /api/v1/auth/login
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = await request.json() as LoginRequest;

    // Simulate authentication
    if (body.token === 'invalid-token') {
      return HttpResponse.json(
        { error: { code: 'INVALID_TOKEN', message: 'Invalid OAuth token' } },
        { status: 401 }
      );
    }

    return HttpResponse.json<{ data: LoginResponse }>({
      data: mockLoginResponse,
    });
  }),

  // POST /api/v1/auth/refresh
  http.post('/api/v1/auth/refresh', async ({ request }) => {
    const body = await request.json() as { refreshToken: string };

    if (body.refreshToken === 'invalid-refresh-token') {
      return HttpResponse.json(
        { error: { code: 'INVALID_TOKEN', message: 'Invalid refresh token' } },
        { status: 401 }
      );
    }

    return HttpResponse.json<{ data: RefreshResponse }>({
      data: {
        accessToken: 'new-access-token',
        expiresIn: 3600,
      },
    });
  }),

  // DELETE /api/v1/auth/logout
  http.delete('/api/v1/auth/logout', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
