// MSW handlers for users API endpoints
import { http, HttpResponse } from 'msw';
import type { UpdatePreferencesRequest } from '@policy-flow/contracts';

export const usersHandlers = [
  // PUT /api/v1/users/me/preferences
  http.put('/api/v1/users/me/preferences', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!authHeader || !authHeader.startsWith('Bearer ') || !token || token === 'null') {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } },
        { status: 401 }
      );
    }

    const body = await request.json() as UpdatePreferencesRequest;

    // Validation
    if (body.interests && body.interests.length === 0) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'At least one interest required' } },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      data: { success: true },
    });
  }),
];
