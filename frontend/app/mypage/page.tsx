export default function MyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 pb-24 md:pb-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-h1 font-bold text-gray-900 mb-4">마이페이지</h1>
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <p className="text-body text-gray-600 text-center">
            내 정보와 북마크한 정책을 관리할 수 있습니다.
          </p>
          <p className="text-caption text-gray-400 text-center mt-2">
            마이페이지 기능은 Phase 1, 3에서 구현됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}
