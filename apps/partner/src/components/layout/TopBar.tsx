'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { locations, opsAlerts } from '@gravl/mock-data';
import { scopeStats } from '@gravl/mock-data';
import { fmtRelative } from '@gravl/domain';
import { cn, tint } from '@gravl/ui';
import { LiveDot, ThemeToggle } from '@gravl/ui';
import type { AlertSeverity } from '@gravl/domain';
import { useDeal, useVertical } from './useTenant';
import { verticalMeta } from './nav';
import { AlertTriangle, Bell, CheckCircle2, ChevronDown, Info, MapPin, Menu, Search, Siren } from 'lucide-react';

const severityStyle: Record<AlertSeverity, { icon: typeof Info; color: string }> = {
  critical: { icon: Siren, color: 'var(--color-gravl-crimson)' },
  warning: { icon: AlertTriangle, color: 'var(--color-gravl-amber)' },
  info: { icon: Info, color: 'var(--color-gravl-cyan)' },
  success: { icon: CheckCircle2, color: 'var(--color-gravl-emerald)' },
};

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const unread = opsAlerts.filter((a) => !readIds.has(a.id)).length;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ''}`}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gravl-text-secondary transition-colors hover:bg-gravl-text/[0.06] hover:text-gravl-text"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="tabular-nums absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gravl-lime px-1 text-[9px] font-black text-gravl-ink">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="gravl-glass absolute right-0 top-full z-50 mt-2 w-[min(380px,calc(100vw-2rem))] animate-slide-up overflow-hidden">
          <div className="flex items-center justify-between border-b border-gravl-text/[0.07] px-4 py-3">
            <p className="text-sm font-bold text-gravl-text">Alertas operativas</p>
            <button
              onClick={() => setReadIds(new Set(opsAlerts.map((a) => a.id)))}
              className="text-[11px] font-semibold text-gravl-volt hover:underline disabled:opacity-40"
              disabled={unread === 0}
            >
              Marcar todo como leído
            </button>
          </div>
          <ul className="max-h-[60vh] divide-y divide-gravl-text/[0.05] overflow-y-auto">
            {opsAlerts.map((a) => {
              const s = severityStyle[a.severity];
              const Icon = s.icon;
              const isRead = readIds.has(a.id);
              const body = (
                <div className={cn('flex gap-3 px-4 py-3 transition-colors hover:bg-gravl-text/[0.03]', isRead && 'opacity-55')}>
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${tint(s.color, 9)}`, color: s.color }}
                  >
                    <Icon size={14} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gravl-text">{a.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-gravl-text-secondary">{a.detail}</p>
                    <p className="mt-1 text-[10px] text-gravl-text-muted">{fmtRelative(a.timestamp)}</p>
                  </div>
                  {!isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gravl-lime" aria-label="Sin leer" />}
                </div>
              );
              return (
                <li key={a.id}>
                  {a.href ? (
                    <Link
                      href={a.href}
                      onClick={() => {
                        setReadIds((p) => new Set(p).add(a.id));
                        setOpen(false);
                      }}
                    >
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function TopBar() {
  const { selectedLocationId, setSelectedLocationId, setMobileNavOpen, setCommandOpen } = useApp();
  const vertical = useVertical();
  const deal = useDeal();
  const stats = scopeStats(selectedLocationId, deal);
  const meta = verticalMeta[vertical];
  const regions = [...new Set(locations.map((l) => l.region ?? 'Otras'))];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gravl-line bg-gravl-canvas/80 px-4 backdrop-blur-xl sm:px-6 xl:px-8">
      <button
        onClick={() => setMobileNavOpen(true)}
        aria-label="Abrir menú"
        className="flex h-9 w-9 items-center justify-center rounded-xl text-gravl-text-secondary hover:bg-gravl-text/[0.05] hover:text-gravl-text lg:hidden"
      >
        <Menu size={18} />
      </button>

      {vertical === 'GYM_CHAIN' ? (
        <div className="flex min-w-0 items-center gap-3">
          <label className="relative flex items-center gap-2 rounded-xl border border-gravl-line bg-gravl-card py-1.5 pl-3 pr-2 transition-colors duration-200 focus-within:border-gravl-text/40 hover:border-gravl-text/25">
            <MapPin size={14} className="shrink-0 text-gravl-text-muted" aria-hidden />
            <span className="sr-only">Sede</span>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="min-w-0 appearance-none bg-transparent pr-5 text-[13px] font-semibold text-gravl-text focus:outline-none"
            >
              <option value="all">Todo el piloto · {locations.length} sedes</option>
              {regions.map((r) => (
                <optgroup key={r} label={r}>
                  {locations.filter((l) => (l.region ?? 'Otras') === r).map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.shortName} · {loc.tier}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2 text-gravl-text-muted" aria-hidden />
          </label>

          <div className="hidden items-center gap-2 text-[13px] text-gravl-text-secondary md:flex" title="Socios con una sesión de GRAVL abierta en este momento">
            <LiveDot />
            <span className="whitespace-nowrap">
              <span className="tabular-nums font-semibold text-gravl-text">{stats.liveNow}</span> entrenando con GRAVL ahora
            </span>
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 items-center gap-2 text-[14px] font-semibold text-gravl-text">
          <meta.icon size={16} className="text-gravl-text-muted" aria-hidden />
          <span className="truncate">{meta.label}</span>
        </div>
      )}

      <div className="flex-1" />

      <span className="hidden rounded-md bg-gravl-ink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-gravl-lime xl:inline dark:bg-gravl-lime dark:text-gravl-ink" title="Todos los números de esta demo son simulados">
        Demo · datos simulados
      </span>

      <button
        onClick={() => setCommandOpen(true)}
        className="flex h-9 items-center gap-2 rounded-xl border border-gravl-line bg-gravl-card px-3 text-[13px] text-gravl-text-muted transition-colors duration-200 hover:border-gravl-text/25 hover:text-gravl-text"
        aria-label="Buscar socios, módulos y acciones"
      >
        <Search size={15} aria-hidden />
        <span className="hidden w-40 text-left md:inline">Buscar…</span>
        <span className="kbd hidden md:inline">⌘K</span>
      </button>

      <ThemeToggle />
      <NotificationsMenu />
    </header>
  );
}
