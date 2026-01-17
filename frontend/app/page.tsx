export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 pb-24 md:pb-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-h1 font-bold text-gray-900 mb-4">정책 캘린더</h1>
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-h2 font-semibold text-gray-900">
              캘린더 뷰가 여기에 표시됩니다
            </h2>
            <p className="text-body text-gray-600">
              나에게 맞는 정책을 한눈에 확인하세요
            </p>
            <p className="text-caption text-gray-400">
              캘린더 기능은 Phase 2에서 구현됩니다.
            </p>
          </div>

          {/* Sample Policy Cards */}
          <div className="mt-8 space-y-3">
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-600"></span>
                  <span className="text-sm font-medium text-green-800">
                    청년 월세 지원
                  </span>
                </div>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                  D-3
                </span>
              </div>
            </div>
            <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-600"></span>
                  <span className="text-sm font-medium text-yellow-800">
                    소상공인 지원금
                  </span>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                  오픈 예정
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
