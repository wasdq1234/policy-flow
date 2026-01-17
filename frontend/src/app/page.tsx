'use client';

import { useState } from 'react';
import { CalendarView } from '@/src/components/calendar/CalendarView';
import type { PolicyListItem } from '@policy-flow/contracts';

export default function HomePage() {
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyListItem | null>(null);

  const handlePolicyClick = (policy: PolicyListItem) => {
    setSelectedPolicy(policy);
    // TODO: 상세 페이지로 이동하거나 모달 표시
    console.log('Policy clicked:', policy);
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

      {selectedPolicy && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
          <h3 className="font-semibold text-gray-900 mb-2">{selectedPolicy.title}</h3>
          <p className="text-sm text-gray-600">{selectedPolicy.summary}</p>
          <button
            onClick={() => setSelectedPolicy(null)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
}
