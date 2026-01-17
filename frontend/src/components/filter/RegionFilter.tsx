import { REGIONS } from '@policy-flow/contracts';
import type { Region } from '@policy-flow/contracts';
import { useFilterStore } from '../../stores/filterStore';

const REGION_LABELS: Record<Region, string> = {
  ALL: '전국',
  SEOUL: '서울',
  BUSAN: '부산',
  DAEGU: '대구',
  INCHEON: '인천',
  GWANGJU: '광주',
  DAEJEON: '대전',
  ULSAN: '울산',
  SEJONG: '세종',
  GYEONGGI: '경기',
  GANGWON: '강원',
  CHUNGBUK: '충북',
  CHUNGNAM: '충남',
  JEONBUK: '전북',
  JEONNAM: '전남',
  GYEONGBUK: '경북',
  GYEONGNAM: '경남',
  JEJU: '제주',
};

export default function RegionFilter() {
  const { region, setRegion } = useFilterStore();

  const handleRegionClick = (selectedRegion: Region) => {
    if (region === selectedRegion) {
      setRegion(null);
    } else {
      setRegion(selectedRegion);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">지역</h3>
      <div className="flex flex-wrap gap-2">
        {REGIONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => handleRegionClick(r)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              region === r
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {REGION_LABELS[r]}
          </button>
        ))}
      </div>
    </div>
  );
}
