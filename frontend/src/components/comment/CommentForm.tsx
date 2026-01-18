import { useState, FormEvent } from 'react';

interface CommentFormProps {
  onSubmit: (data: { content: string; nickname?: string }) => void | Promise<void>;
  placeholder?: string;
  buttonText?: string;
  showNickname?: boolean;
}

export function CommentForm({
  onSubmit,
  placeholder = '댓글을 입력하세요',
  buttonText = '등록',
  showNickname = false,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    await onSubmit({
      content,
      nickname: nickname.trim() || undefined,
    });

    setContent('');
    setNickname('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={3}
      />

      {showNickname && (
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임 (선택)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!content.trim()}
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
}
