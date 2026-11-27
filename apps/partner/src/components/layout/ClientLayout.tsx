'use client';

import React, { type ReactNode } from 'react';
import { useApp } from '@/context/AppContext';
import { cn } from '@gravl/ui';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ToastContainer from './ToastContainer';
import MobilePreviewDrawer from './MobilePreviewDrawer';
import CommandPalette from './CommandPalette';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { sidebarCollapsed, mobilePreviewOpen } = useApp();

  return (
    <div className="min-h-screen text-gravl-text">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-gravl-lime focus:px-3 focus:py-2 focus:text-sm focus:font-bold focus:text-gravl-ink"
      >
        Saltar al contenido
      </a>
      <Sidebar />
      <div
        className={cn(
          'flex min-w-0 flex-col transition-[padding] duration-300',
          sidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]',
          mobilePreviewOpen && '2xl:pr-[400px]',
        )}
      >
        <TopBar />
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 xl:px-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
      <MobilePreviewDrawer />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
}
