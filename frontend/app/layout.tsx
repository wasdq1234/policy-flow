import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/src/components/layout/Header';
import TabBar from '@/src/components/layout/TabBar';
import Footer from '@/src/components/layout/Footer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://policy-flow.pages.dev'),
  title: {
    default: '정책플로우 - 맞춤 정책 캘린더',
    template: '%s | 정책플로우',
  },
  description: '모든 국민이 자신에게 해당하는 정책 자금을 놓치지 않도록 돕는 맞춤형 정책 캘린더 서비스',
  keywords: ['정책', '지원금', '정부지원', '청년', '정책캘린더', '보조금', '정책정보', '복지'],
  authors: [{ name: 'PolicyFlow Team' }],
  creator: 'PolicyFlow',
  publisher: 'PolicyFlow',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://policy-flow.pages.dev',
    siteName: '정책플로우',
    title: '정책플로우 - 맞춤 정책 캘린더',
    description: '정부 지원금을 놓치지 마세요',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '정책플로우 - 맞춤 정책 캘린더',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '정책플로우 - 맞춤 정책 캘린더',
    description: '정부 지원금을 놓치지 마세요',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    other: {
      'naver-site-verification': 'naver-verification-code',
    },
  },
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
