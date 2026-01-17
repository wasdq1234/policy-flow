'use client';

import { Modal } from '@/src/components/ui/Modal';
import { usePolicyDetail } from '@/src/hooks/usePolicyDetail';
import { CATEGORY_LABELS, REGION_LABELS, STATUS_LABELS } from '@/src/constants/labels';
import { POLICY_STATUS_DISPLAY } from '@policy-flow/contracts';

interface PolicyDetailModalProps {
  policyId: string;
  onClose: () => void;
}

export function PolicyDetailModal({ policyId, onClose }: PolicyDetailModalProps) {
  const { policy, isLoading, error } = usePolicyDetail(policyId);

  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status: string): string => {
    const statusConfig = POLICY_STATUS_DISPLAY[status as keyof typeof POLICY_STATUS_DISPLAY];
    if (!statusConfig) return 'bg-gray-100 text-gray-800';

    const colorMap: Record<string, string> = {
      green: 'bg-green-100 text-green-800',
      orange: 'bg-orange-100 text-orange-800',
      blue: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-800',
    };

    return colorMap[statusConfig.color] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-red-500">에러가 발생했습니다: {error.message}</div>
        </div>
      ) : policy ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4 pr-8">
              <h2 className="text-2xl font-bold text-gray-900">{policy.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(policy.status)}`}>
                {STATUS_LABELS[policy.status]}
              </span>
            </div>
          </div>

          {/* Summary */}
          {policy.summary && (
            <div className="text-gray-700 leading-relaxed">{policy.summary}</div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-6">
            {/* Category & Region */}
            <div className="flex gap-8">
              <div>
                <div className="text-sm text-gray-500 mb-1">카테고리</div>
                <div className="font-medium text-gray-900">{CATEGORY_LABELS[policy.category]}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">지역</div>
                <div className="font-medium text-gray-900">{REGION_LABELS[policy.region]}</div>
              </div>
            </div>

            {/* Application Period */}
            <div>
              <div className="text-sm text-gray-500 mb-1">신청 기간</div>
              <div className="font-medium text-gray-900">
                {policy.isAlwaysOpen ? (
                  '상시 접수'
                ) : (
                  <>
                    {formatDate(policy.startDate)} ~ {formatDate(policy.endDate)}
                  </>
                )}
              </div>
            </div>

            {/* Target Age */}
            {(policy.targetAgeMin !== null || policy.targetAgeMax !== null) && (
              <div>
                <div className="text-sm text-gray-500 mb-1">대상 연령</div>
                <div className="font-medium text-gray-900">
                  {policy.targetAgeMin !== null && policy.targetAgeMax !== null
                    ? `${policy.targetAgeMin}세 ~ ${policy.targetAgeMax}세`
                    : policy.targetAgeMin !== null
                    ? `${policy.targetAgeMin}세 이상`
                    : policy.targetAgeMax !== null
                    ? `${policy.targetAgeMax}세 이하`
                    : '제한 없음'}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-gray-200 pt-6">
            {policy.applyUrl && (
              <a
                href={policy.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                신청하기
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                // Phase 3에서 구현 예정
                console.log('북마크 기능은 Phase 3에서 구현됩니다.');
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              북마크
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
