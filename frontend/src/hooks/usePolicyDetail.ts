import { useState, useEffect } from 'react';
import type { PolicyDetail } from '@policy-flow/contracts';

interface UsePolicyDetailResult {
  policy: PolicyDetail | null;
  isLoading: boolean;
  error: Error | null;
}

export function usePolicyDetail(policyId: string): UsePolicyDetailResult {
  const [policy, setPolicy] = useState<PolicyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPolicyDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/policies/${policyId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch policy: ${response.statusText}`);
        }

        const data = await response.json();
        setPolicy(data.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setPolicy(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicyDetail();
  }, [policyId]);

  return {
    policy,
    isLoading,
    error,
  };
}
