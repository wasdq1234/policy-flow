// MSW handlers test - verify API mocking works correctly
import { describe, it, expect } from 'vitest';

describe('MSW API Mocking', () => {
  describe('Auth API', () => {
    it('mocks login endpoint successfully', async () => {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'KAKAO', token: 'valid-token' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty('accessToken');
      expect(data.data).toHaveProperty('user');
      expect(data.data.user.email).toBe('test@example.com');
    });

    it('mocks login error with invalid token', async () => {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'KAKAO', token: 'invalid-token' }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error.code).toBe('INVALID_TOKEN');
    });

    it('mocks token refresh endpoint', async () => {
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toHaveProperty('accessToken');
      expect(data.data.accessToken).toBe('new-access-token');
    });

    it('mocks logout endpoint', async () => {
      const response = await fetch('/api/v1/auth/logout', {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);
    });
  });

  describe('Policies API', () => {
    it('mocks policy list endpoint', async () => {
      const response = await fetch('/api/v1/policies?page=1&limit=20');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.meta).toHaveProperty('page');
      expect(data.meta).toHaveProperty('total');
    });

    it('mocks policy list with filters', async () => {
      const response = await fetch('/api/v1/policies?category=HOUSING');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
      if (data.data.length > 0) {
        expect(data.data[0].category).toBe('HOUSING');
      }
    });

    it('mocks policy detail endpoint', async () => {
      const response = await fetch('/api/v1/policies/policy-1');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.id).toBe('policy-1');
      expect(data.data).toHaveProperty('applyUrl');
      expect(data.data).toHaveProperty('targetAgeMin');
    });

    it('mocks policy not found error', async () => {
      const response = await fetch('/api/v1/policies/non-existent');

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Bookmarks API', () => {
    it('requires authentication for bookmark list', async () => {
      const response = await fetch('/api/v1/bookmarks');

      expect(response.status).toBe(401);
    });

    it('mocks bookmark list with auth', async () => {
      const response = await fetch('/api/v1/bookmarks', {
        headers: { Authorization: 'Bearer mock-access-token' },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
    });

    it('mocks bookmark creation', async () => {
      const response = await fetch('/api/v1/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-access-token',
        },
        body: JSON.stringify({ policyId: 'policy-1', notifyBeforeDays: 5 }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.data.policyId).toBe('policy-1');
      expect(data.data.notifyBeforeDays).toBe(5);
    });

    it('mocks bookmark deletion', async () => {
      const response = await fetch('/api/v1/bookmarks/policy-1', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer mock-access-token' },
      });

      expect(response.status).toBe(204);
    });
  });

  describe('Posts API', () => {
    it('mocks post list endpoint', async () => {
      const response = await fetch('/api/v1/posts?page=1');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('mocks post list with filters', async () => {
      const response = await fetch('/api/v1/posts?policyId=policy-1');

      expect(response.status).toBe(200);
      const data = await response.json();
      if (data.data.length > 0) {
        expect(data.data[0].policyId).toBe('policy-1');
      }
    });

    it('requires authentication for post creation', async () => {
      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test', content: 'Content', postType: 'REVIEW' }),
      });

      expect(response.status).toBe(401);
    });

    it('mocks post creation with auth', async () => {
      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-access-token',
        },
        body: JSON.stringify({
          title: 'New Post',
          content: 'Post content',
          postType: 'REVIEW',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.data.title).toBe('New Post');
    });

    it('mocks post detail endpoint', async () => {
      const response = await fetch('/api/v1/posts/1');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.id).toBe(1);
      expect(data.data).toHaveProperty('isLikedByMe');
    });

    it('mocks comments endpoint', async () => {
      const response = await fetch('/api/v1/posts/1/comments');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
    });
  });
});
