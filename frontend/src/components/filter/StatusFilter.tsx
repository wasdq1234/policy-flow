import { POLICY_STATUSES } from '@policy-flow/contracts';
import type { PolicyStatus } from '@policy-flow/contracts';
import { useFilterStore } from '../../stores/filterStore';

const STATUS_LABELS: Record<PolicyStatus, string> = {
  OPEN: '접수중',
  CLOSING_SOON: '마감임박',
  UPCOMING: '오픈예정',
  CLOSED: '마감',
};

export default function StatusFilter() {
  const { status, setStatus } = useFilterStore();

  const handleStatusClick = (selectedStatus: PolicyStatus) => {
    if (status === selectedStatus) {
      setStatus(null);
    } else {
      setStatus(selectedStatus);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">상태</h3>
      <div className="flex flex-wrap gap-2">
        {POLICY_STATUSES.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => handleStatusClick(st)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === st
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {STATUS_LABELS[st]}
          </button>
        ))}
      </div>
    </div>
  );
}
