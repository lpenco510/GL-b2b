import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Coach Studio' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
