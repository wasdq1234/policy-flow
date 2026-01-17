'use client';

import { useState } from 'react';
import { CalendarView } from '@/src/components/calendar/CalendarView';
import { PolicyDetailModal } from '@/src/components/policy/PolicyDetailModal';
import type { PolicyListItem } from '@policy-flow/contracts';

export default function HomePage() {
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  const handlePolicyClick = (policy: PolicyListItem) => {
    setSelectedPolicyId(policy.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">PolicyFlow KR</h1>
          <p className="text-sm text-gray-600">청년을 위한 정책 정보 캘린더</p>
        </div>
      </header>

      <main className="py-8">
        <CalendarView onPolicyClick={handlePolicyClick} />
      </main>

      {selectedPolicyId && (
        <PolicyDetailModal
          policyId={selectedPolicyId}
          onClose={() => setSelectedPolicyId(null)}
        />
      )}
    </div>
  );
}
