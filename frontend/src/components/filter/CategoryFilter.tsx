import { POLICY_CATEGORIES } from '@policy-flow/contracts';
import type { PolicyCategory } from '@policy-flow/contracts';
import { useFilterStore } from '../../stores/filterStore';

const CATEGORY_LABELS: Record<PolicyCategory, string> = {
  JOB: '취업',
  HOUSING: '주거',
  LOAN: '대출',
  EDUCATION: '교육',
  STARTUP: '창업',
  WELFARE: '복지',
};

export default function CategoryFilter() {
  const { category, setCategory } = useFilterStore();

  const handleCategoryClick = (selectedCategory: PolicyCategory) => {
    if (category === selectedCategory) {
      setCategory(null);
    } else {
      setCategory(selectedCategory);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">분야</h3>
      <div className="flex flex-wrap gap-2">
        {POLICY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryClick(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
    </div>
  );
}
