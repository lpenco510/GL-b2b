'use client';

import React, { ReactNode } from 'react';
import { useApp } from '@/context/AppContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ToastContainer from './ToastContainer';
import MobilePreviewDrawer from './MobilePreviewDrawer';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { sidebarCollapsed, mobilePreviewOpen } = useApp();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        } ${mobilePreviewOpen ? 'mr-[380px]' : ''}`}
      >
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <MobilePreviewDrawer />
      <ToastContainer />
    </div>
  );
}
