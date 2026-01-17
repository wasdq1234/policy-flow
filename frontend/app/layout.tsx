import type { Metadata } from 'next';
import './globals.css';
import Header from '@/src/components/layout/Header';
import TabBar from '@/src/components/layout/TabBar';
import Footer from '@/src/components/layout/Footer';

export const metadata: Metadata = {
  title: 'PolicyFlow KR - 정책 캘린더',
  description: '모든 국민이 자신에게 해당하는 정책 자금을 단 1원도 놓치지 않도록 돕습니다',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
      </head>
      <body className="font-sans bg-gray-50">
        <Header />
        <div className="min-h-screen pb-16 md:pb-0">
          {children}
        </div>
        <TabBar />
        <Footer />
      </body>
    </html>
  );
}
