import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Agent Conversation | s45',
  description: 'Interactive agent conversation powered by s45',
  openGraph: {
    title: 'Agent Conversation | s45',
    description: 'Interactive agent conversation powered by s45',
    type: 'website',
  },
};

export default async function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
