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
    <div className="flex min-h-screen bg-[#080A0E] text-[#F8FAFC]">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'pl-[74px]' : 'pl-[260px]'
        } ${mobilePreviewOpen ? 'pr-[390px]' : ''}`}
      >
        <TopBar />
        <main className="flex-1 px-6 xl:px-10 py-6 overflow-y-auto">
          {children}
        </main>
      </div>
      <MobilePreviewDrawer />
      <ToastContainer />
    </div>
  );
}
