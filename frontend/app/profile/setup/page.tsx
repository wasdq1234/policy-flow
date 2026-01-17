'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AgeGroup, Region, PolicyCategory } from '@policy-flow/contracts';
import { AgeSelector } from '@/src/components/profile/AgeSelector';
import { RegionSelector } from '@/src/components/profile/RegionSelector';
import { CategorySelector } from '@/src/components/profile/CategorySelector';
import { useAuthStore } from '@/src/stores/authStore';

export default function ProfileSetupPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [interests, setInterests] = useState<PolicyCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (interests.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/users/me/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ageGroup,
          region,
          interests,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      router.push('/');
    } catch (err) {
      setError('설정 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          프로필 설정
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Step 1: Age Group */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                나이대를 선택해주세요
              </h2>
              <span className="text-sm text-gray-500">1/3</span>
            </div>
            <AgeSelector value={ageGroup} onChange={setAgeGroup} />
          </section>

          {/* Step 2: Region */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                거주 지역을 선택해주세요
              </h2>
              <span className="text-sm text-gray-500">2/3</span>
            </div>
            <RegionSelector value={region} onChange={setRegion} />
          </section>

          {/* Step 3: Interests */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                관심 분야를 선택해주세요
              </h2>
              <span className="text-sm text-gray-500">3/3</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              최소 1개 이상 선택해주세요
            </p>
            <CategorySelector value={interests} onChange={setInterests} />
          </section>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={interests.length === 0 || isLoading}
            className={`
              w-full py-4 rounded-lg font-semibold text-white transition-all
              ${
                interests.length === 0 || isLoading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
              }
            `}
          >
            {isLoading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
