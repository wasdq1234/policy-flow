import { POLICY_CATEGORIES, type PolicyCategory } from '@policy-flow/contracts';
import { CATEGORY_LABELS } from '@/src/constants/labels';

interface CategorySelectorProps {
  value: PolicyCategory[];
  onChange: (value: PolicyCategory[]) => void;
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const handleToggle = (category: PolicyCategory) => {
    if (value.includes(category)) {
      onChange(value.filter((c) => c !== category));
    } else {
      onChange([...value, category]);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {POLICY_CATEGORIES.map((category) => {
        const isSelected = value.includes(category);
        return (
          <button
            key={category}
            type="button"
            onClick={() => handleToggle(category)}
            className={`
              px-4 py-3 rounded-lg font-medium text-sm transition-all
              ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }
            `}
          >
            {CATEGORY_LABELS[category]}
          </button>
        );
      })}
    </div>
  );
}
