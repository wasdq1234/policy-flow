import { useFilterStore } from '../../stores/filterStore';
import RegionFilter from './RegionFilter';
import CategoryFilter from './CategoryFilter';
import StatusFilter from './StatusFilter';

export default function FilterPanel() {
  const { resetFilters } = useFilterStore();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">필터</h2>
        <button
          type="button"
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          초기화
        </button>
      </div>

      <div className="space-y-4">
        <RegionFilter />
        <CategoryFilter />
        <StatusFilter />
      </div>
    </div>
  );
}
