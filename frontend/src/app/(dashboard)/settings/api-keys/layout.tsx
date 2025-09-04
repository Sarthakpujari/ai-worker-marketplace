import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Keys | s45',
  description: 'Manage your API keys for programmatic access to s45',
  openGraph: {
    title: 'API Keys | s45',
    description: 'Manage your API keys for programmatic access to s45',
    type: 'website',
  },
};

export default async function APIKeysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
