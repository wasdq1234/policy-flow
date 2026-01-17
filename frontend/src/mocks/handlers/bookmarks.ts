// MSW handlers for bookmarks API endpoints
import { http, HttpResponse } from 'msw';
import type { BookmarkListItem, CreateBookmarkRequest, CreateBookmarkResponse } from '@policy-flow/contracts';
import { mockPolicies } from '../data/policies';

// In-memory storage for bookmarks (per session)
const mockBookmarksStorage: Map<string, BookmarkListItem> = new Map([
  ['policy-1', {
    policyId: 'policy-1',
    policy: mockPolicies[0],
    notifyBeforeDays: 3,
    createdAt: Math.floor(Date.now() / 1000) - 86400,
  }],
]);

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

    const bookmarks = Array.from(mockBookmarksStorage.values());
    return HttpResponse.json({
      data: bookmarks,
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

    // Check if already bookmarked
    if (mockBookmarksStorage.has(body.policyId)) {
      return HttpResponse.json(
        { error: { code: 'ALREADY_BOOKMARKED', message: 'Already bookmarked' } },
        { status: 409 }
      );
    }

    // Find the policy
    const policy = mockPolicies.find(p => p.id === body.policyId);
    if (!policy) {
      return HttpResponse.json(
        { error: { code: 'POLICY_NOT_FOUND', message: 'Policy not found' } },
        { status: 404 }
      );
    }

    const createdAt = Math.floor(Date.now() / 1000);
    const newBookmark: BookmarkListItem = {
      policyId: body.policyId,
      policy: policy,
      notifyBeforeDays: body.notifyBeforeDays || 3,
      createdAt,
    };

    mockBookmarksStorage.set(body.policyId, newBookmark);

    const response: CreateBookmarkResponse = {
      policyId: body.policyId,
      notifyBeforeDays: body.notifyBeforeDays || 3,
      createdAt,
    };

    return HttpResponse.json<{ data: CreateBookmarkResponse }>({
      data: response,
    }, { status: 201 });
  }),

  // DELETE /api/v1/bookmarks/:policyId
  http.delete('/api/v1/bookmarks/:policyId', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { policyId } = params as { policyId: string };

    if (!mockBookmarksStorage.has(policyId)) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Bookmark not found' } },
        { status: 404 }
      );
    }

    mockBookmarksStorage.delete(policyId);
    return new HttpResponse(null, { status: 204 });
  }),
];
