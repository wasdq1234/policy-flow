// MSW handlers for bookmarks API endpoints
import { http, HttpResponse } from 'msw';
import type { BookmarkListItem, CreateBookmarkRequest, CreateBookmarkResponse } from '@policy-flow/contracts';
import { mockPolicies } from '../data/policies';

const mockBookmarks: BookmarkListItem[] = [
  {
    policyId: 'policy-1',
    policy: mockPolicies[0],
    notifyBeforeDays: 3,
    createdAt: Math.floor(Date.now() / 1000) - 86400,
  },
];

export const bookmarksHandlers = [
  // GET /api/v1/bookmarks
  http.get('/api/v1/bookmarks', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      data: mockBookmarks,
    });
  }),

  // POST /api/v1/bookmarks
  http.post('/api/v1/bookmarks', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const body = await request.json() as CreateBookmarkRequest;

    const newBookmark: CreateBookmarkResponse = {
      policyId: body.policyId,
      notifyBeforeDays: body.notifyBeforeDays || 3,
      createdAt: Math.floor(Date.now() / 1000),
    };

    return HttpResponse.json<{ data: CreateBookmarkResponse }>({
      data: newBookmark,
    }, { status: 201 });
  }),

  // DELETE /api/v1/bookmarks/:policyId
  http.delete('/api/v1/bookmarks/:policyId', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
