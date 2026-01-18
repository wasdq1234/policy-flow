import { PostDetailContent } from './PostDetailContent';

interface PostDetailPageProps {
  params: {
    id: string;
  };
}

// For static export - generate pages for sample IDs
// Note: In production, this would fetch from API or database
export async function generateStaticParams() {
  // Return sample post IDs for static generation
  // Client-side routing will handle other IDs dynamically
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  return <PostDetailContent id={params.id} />;
}
