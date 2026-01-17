import type { PolicyListItem } from '@policy-flow/contracts';

interface PolicyEventBarProps {
  policy: PolicyListItem;
  onClick: (policy: PolicyListItem) => void;
}

const STATUS_COLORS = {
  OPEN: 'bg-blue-500',
  CLOSING_SOON: 'bg-red-500',
  UPCOMING: 'bg-gray-400',
  CLOSED: 'bg-gray-300',
} as const;

export function PolicyEventBar({ policy, onClick }: PolicyEventBarProps) {
  const colorClass = STATUS_COLORS[policy.status];

  const handleClick = () => {
    onClick(policy);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(policy);
    }
  };

  return (
    <div
      data-testid="policy-event-bar"
      role="button"
      tabIndex={0}
      className={`${colorClass} text-white text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity truncate`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {policy.title}
    </div>
  );
}
