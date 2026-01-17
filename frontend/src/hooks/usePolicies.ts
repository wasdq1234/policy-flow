import { useState, useEffect, useCallback } from 'react';
import type { PolicyListItem } from '@policy-flow/contracts';
import type { GetPoliciesQuery } from '@policy-flow/contracts';

interface UsePoliciesResult {
  policies: PolicyListItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePolicies(query?: GetPoliciesQuery): UsePoliciesResult {
  const [policies, setPolicies] = useState<PolicyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPolicies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query string
      const params = new URLSearchParams();
      if (query?.page) params.append('page', query.page.toString());
      if (query?.limit) params.append('limit', query.limit.toString());
      if (query?.region) params.append('region', query.region);
      if (query?.category) params.append('category', query.category);
      if (query?.status) params.append('status', query.status);
      if (query?.search) params.append('search', query.search);

      const url = `/api/v1/policies${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch policies: ${response.statusText}`);
      }

      const data = await response.json();
      setPolicies(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setPolicies([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    query?.page,
    query?.limit,
    query?.region,
    query?.category,
    query?.status,
    query?.search,
  ]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  return {
    policies,
    isLoading,
    error,
    refetch: fetchPolicies,
  };
}
