'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle size={18} className="text-gravl-emerald flex-shrink-0" />,
    info: <Info size={18} className="text-gravl-cyan flex-shrink-0" />,
    warning: <AlertTriangle size={18} className="text-gravl-amber flex-shrink-0" />,
  };

  const borderMap = {
    success: 'border-gravl-emerald/30',
    info: 'border-gravl-cyan/30',
    warning: 'border-gravl-amber/30',
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter liquid-glass-static flex items-start gap-3 px-4 py-3 ${borderMap[toast.type]}`}
        >
          {iconMap[toast.type]}
          <p className="text-sm text-gravl-text flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gravl-text-muted hover:text-gravl-text transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
