import type { Metadata } from 'next';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
