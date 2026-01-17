'use client';

import Link from 'next/link';
import Button from '../ui/Button';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-h3 font-bold text-primary-600">PolicyFlow KR</h1>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // TODO: 로그인 처리
                console.log('Login clicked');
              }}
            >
              로그인
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
