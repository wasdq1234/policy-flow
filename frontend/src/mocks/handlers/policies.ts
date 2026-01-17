// MSW handlers for policies API endpoints
import { http, HttpResponse } from 'msw';
import type { GetPoliciesQuery, PolicyListItem, PolicyDetail } from '@policy-flow/contracts';
import { mockPolicies, mockPolicyDetail } from '../data/policies';

export const policiesHandlers = [
  // GET /api/v1/policies
  http.get('/api/v1/policies', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const category = url.searchParams.get('category');
    const region = url.searchParams.get('region');
    const search = url.searchParams.get('search');

    let filtered = [...mockPolicies];

    // Apply filters
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    if (region) {
      filtered = filtered.filter(p => p.region === region);
    }
    if (search) {
      filtered = filtered.filter(p =>
        p.title.includes(search) || p.summary?.includes(search)
      );
    }

    // Pagination
    const total = filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filtered.slice(start, end);

    return HttpResponse.json({
      data: paginatedData,
      meta: {
        page,
        limit,
        total,
        hasNext: end < total,
      },
    });
  }),

  // GET /api/v1/policies/:id
  http.get('/api/v1/policies/:id', ({ params }) => {
    const { id } = params;

    if (id === 'policy-1') {
      return HttpResponse.json<{ data: PolicyDetail }>({
        data: mockPolicyDetail,
      });
    }

    const policy = mockPolicies.find(p => p.id === id);
    if (!policy) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Policy not found' } },
        { status: 404 }
      );
    }

    // Convert PolicyListItem to PolicyDetail
    const detail: PolicyDetail = {
      ...policy,
      applyUrl: null,
      targetAgeMin: null,
      targetAgeMax: null,
      detailJson: null,
      createdAt: Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60,
      updatedAt: Math.floor(Date.now() / 1000),
    };

    return HttpResponse.json<{ data: PolicyDetail }>({
      data: detail,
    });
  }),
];
