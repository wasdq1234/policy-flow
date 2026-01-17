import { REGIONS, type Region } from '@policy-flow/contracts';
import { REGION_LABELS } from '@/src/constants/labels';

interface RegionSelectorProps {
  value: Region | null;
  onChange: (value: Region) => void;
}

export function RegionSelector({ value, onChange }: RegionSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
      {REGIONS.map((region) => {
        const isSelected = value === region;
        return (
          <button
            key={region}
            type="button"
            onClick={() => onChange(region)}
            className={`
              px-3 py-2 rounded-lg font-medium text-sm transition-all
              ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }
            `}
          >
            {REGION_LABELS[region]}
          </button>
        );
      })}
    </div>
  );
}
