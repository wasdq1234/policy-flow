import type { PolicyListItem, PolicyCategory, Region } from '@policy-flow/contracts';
import { fromUnixTimestamp, formatDate } from '@/src/lib/dateUtils';

interface ListViewProps {
  policies: PolicyListItem[];
  onPolicyClick: (policy: PolicyListItem) => void;
}

const CATEGORY_LABELS: Record<PolicyCategory, string> = {
  JOB: '취업/창업',
  HOUSING: '주거/생활',
  LOAN: '금융/대출',
  EDUCATION: '교육/장학',
  STARTUP: '창업지원',
  WELFARE: '복지/지원',
};

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

const STATUS_LABELS = {
  OPEN: '접수중',
  CLOSING_SOON: '마감임박',
  UPCOMING: '오픈예정',
  CLOSED: '마감',
} as const;

const STATUS_COLORS = {
  OPEN: 'bg-green-100 text-green-800',
  CLOSING_SOON: 'bg-red-100 text-red-800',
  UPCOMING: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-gray-100 text-gray-800',
} as const;

export function ListView({ policies, onPolicyClick }: ListViewProps) {
  if (policies.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        정책이 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {policies.map((policy) => (
        <div
          key={policy.id}
          role="button"
          tabIndex={0}
          onClick={() => onPolicyClick(policy)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onPolicyClick(policy);
            }
          }}
          className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{policy.title}</h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${
                STATUS_COLORS[policy.status]
              }`}
            >
              {STATUS_LABELS[policy.status]}
            </span>
          </div>

          {policy.summary && (
            <p className="text-sm text-gray-600 mb-3">{policy.summary}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{CATEGORY_LABELS[policy.category]}</span>
            <span>•</span>
            <span>{REGION_LABELS[policy.region]}</span>
            {policy.startDate && policy.endDate && (
              <>
                <span>•</span>
                <span>
                  {formatDate(fromUnixTimestamp(policy.startDate))} ~{' '}
                  {formatDate(fromUnixTimestamp(policy.endDate))}
                </span>
              </>
            )}
            {policy.isAlwaysOpen && (
              <>
                <span>•</span>
                <span className="text-blue-600 font-medium">상시 접수</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
