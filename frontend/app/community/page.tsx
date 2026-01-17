export default function CommunityPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 pb-24 md:pb-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-h1 font-bold text-gray-900 mb-4">커뮤니티 게시판</h1>
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <p className="text-body text-gray-600 text-center">
            정책 정보를 공유하고 소통하는 공간입니다.
          </p>
          <p className="text-caption text-gray-400 text-center mt-2">
            게시판 기능은 Phase 4에서 구현됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}
