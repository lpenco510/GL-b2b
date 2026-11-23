'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { VerticalType } from '@/types/gravl-b2b';

interface AppContextType {
  vertical: VerticalType;
  setVertical: (v: VerticalType) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobilePreviewOpen: boolean;
  setMobilePreviewOpen: (open: boolean) => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  selectedLocationId: string;
  setSelectedLocationId: (id: string) => void;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [vertical, setVertical] = useState<VerticalType>('GYM_CHAIN');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('loc_palermo');

  const toggleSidebar = useCallback(() => setSidebarCollapsed((p) => !p), []);

  const addToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        vertical, setVertical,
        sidebarCollapsed, toggleSidebar,
        mobilePreviewOpen, setMobilePreviewOpen,
        toasts, addToast, removeToast,
        selectedLocationId, setSelectedLocationId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
