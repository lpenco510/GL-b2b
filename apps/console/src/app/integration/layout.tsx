import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Integración GRAVL' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
