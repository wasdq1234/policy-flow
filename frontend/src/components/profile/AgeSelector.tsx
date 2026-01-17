import { AGE_GROUPS, type AgeGroup } from '@policy-flow/contracts';
import { AGE_GROUP_LABELS } from '@/src/constants/labels';

interface AgeSelectorProps {
  value: AgeGroup | null;
  onChange: (value: AgeGroup) => void;
}

export function AgeSelector({ value, onChange }: AgeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {AGE_GROUPS.map((ageGroup) => {
        const isSelected = value === ageGroup;
        return (
          <button
            key={ageGroup}
            type="button"
            onClick={() => onChange(ageGroup)}
            className={`
              px-4 py-3 rounded-lg font-medium text-sm transition-all
              ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }
            `}
          >
            {AGE_GROUP_LABELS[ageGroup]}
          </button>
        );
      })}
    </div>
  );
}
