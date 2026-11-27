'use client';

import { tint } from '@gravl/ui';

import React from 'react';
import { useApp, type ToastType } from '@/context/AppContext';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const styles: Record<ToastType, { icon: typeof Info; color: string }> = {
  success: { icon: CheckCircle2, color: 'var(--color-gravl-emerald)' },
  info: { icon: Info, color: 'var(--color-gravl-cyan)' },
  warning: { icon: AlertTriangle, color: 'var(--color-gravl-amber)' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 left-4 right-4 z-[100] flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:bottom-6"
    >
      {toasts.map((toast) => {
        const s = styles[toast.type];
        const Icon = s.icon;
        return (
          <div
            key={toast.id}
            role="status"
            className="gravl-glass pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 px-4 py-3"
            style={{ borderColor: `${tint(s.color, 25)}` }}
          >
            <Icon size={18} className="mt-px shrink-0" style={{ color: s.color }} aria-hidden />
            <p className="flex-1 text-[13px] leading-snug text-gravl-text">{toast.message}</p>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick();
                  removeToast(toast.id);
                }}
                className="shrink-0 text-xs font-bold text-gravl-volt hover:underline"
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Descartar"
              className="shrink-0 text-gravl-text-muted transition-colors hover:text-gravl-text"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
