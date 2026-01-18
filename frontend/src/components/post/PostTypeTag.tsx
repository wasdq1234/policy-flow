import type { PostType } from '@policy-flow/contracts';

interface PostTypeTagProps {
  type: PostType;
}

const POST_TYPE_CONFIG = {
  TIP: {
    label: '꿀팁',
    className: 'bg-blue-100 text-blue-700',
  },
  QUESTION: {
    label: '질문',
    className: 'bg-orange-100 text-orange-700',
  },
  REVIEW: {
    label: '후기',
    className: 'bg-green-100 text-green-700',
  },
  GENERAL: {
    label: '일반',
    className: 'bg-gray-100 text-gray-700',
  },
} as const;

export function PostTypeTag({ type }: PostTypeTagProps) {
  const config = POST_TYPE_CONFIG[type];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
