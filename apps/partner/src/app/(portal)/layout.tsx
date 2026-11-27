import { AppProvider } from '@/context/AppContext';
import ClientLayout from '@/components/layout/ClientLayout';

/** Todo lo que está en (portal) requiere sesión (ver src/proxy.ts) y lleva el shell con sidebar. */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <ClientLayout>{children}</ClientLayout>
    </AppProvider>
  );
}
