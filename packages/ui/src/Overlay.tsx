'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from './cn';

/**
 * Comportamiento común de modales y drawers:
 *  • Esc cierra, click en el backdrop cierra.
 *  • Bloquea el scroll del body y devuelve el foco al disparador.
 *  • Con cacheComponents las páginas se ocultan con <Activity> en vez de
 *    desmontarse; el cleanup de useLayoutEffect cierra el overlay al navegar
 *    para no volver a una página con un modal abierto.
 */
function useOverlay(open: boolean, onClose: () => void, panelRef: React.RefObject<HTMLDivElement | null>) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useLayoutEffect(() => () => onCloseRef.current(), []);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFirst = () => {
      const el = panelRef.current?.querySelector<HTMLElement>(
        '[data-autofocus], input, textarea, select, button:not([data-close])',
      );
      (el ?? panelRef.current)?.focus();
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, panelRef]);
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useOverlay(open, onClose, panelRef);
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/65 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'gravl-glass relative flex max-h-[92vh] w-full animate-slide-up flex-col rounded-b-none sm:rounded-2xl',
          size === 'sm' && 'sm:max-w-md',
          size === 'md' && 'sm:max-w-lg',
          size === 'lg' && 'sm:max-w-3xl',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-6 pb-4 pt-5">
          <div>
            <h2 className="text-base font-bold text-white">{title}</h2>
            {description && <div className="mt-1 text-xs text-gravl-text-secondary">{description}</div>}
          </div>
          <button
            data-close
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-gravl-text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-white/[0.07] px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 460,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useOverlay(open, onClose, panelRef);
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[85]">
      <div className="absolute inset-0 animate-fade-in bg-black/55 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Detalle'}
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-full animate-slide-in-right flex-col border-l border-white/[0.1] bg-[#0C1017]/97 shadow-2xl backdrop-blur-xl"
        style={{ maxWidth: width }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
          <div className="min-w-0">
            <div className="text-base font-bold text-white">{title}</div>
            {subtitle && <div className="mt-1 text-xs text-gravl-text-secondary">{subtitle}</div>}
          </div>
          <button
            data-close
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-gravl-text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-white/[0.07] px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
