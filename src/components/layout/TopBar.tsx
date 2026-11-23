'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { locations, opsAlerts } from '@/data/mockGravlB2B';
import { scopeStats } from '@/data/selectors';
import { fmtRelative } from '@/lib/format';
import { cn } from '@/lib/cn';
import { LiveDot } from '@/components/ui/primitives';
import type { AlertSeverity } from '@/types/gravl-b2b';
import { useVertical } from './useVertical';
import { verticalMeta } from './nav';
import { AlertTriangle, Bell, CheckCircle2, ChevronDown, Info, MapPin, Menu, Search, Siren } from 'lucide-react';

const severityStyle: Record<AlertSeverity, { icon: typeof Info; color: string }> = {
  critical: { icon: Siren, color: '#EF4444' },
  warning: { icon: AlertTriangle, color: '#F59E0B' },
  info: { icon: Info, color: '#38BDF8' },
  success: { icon: CheckCircle2, color: '#22C55E' },
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
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-gravl-raised text-gravl-text-secondary transition-colors hover:border-white/[0.18] hover:text-white"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="tabular-nums absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gravl-volt px-1 text-[9px] font-black text-gravl-canvas">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="gravl-glass absolute right-0 top-full z-50 mt-2 w-[min(380px,calc(100vw-2rem))] animate-slide-up overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
            <p className="text-sm font-bold text-white">Alertas operativas</p>
            <button
              onClick={() => setReadIds(new Set(opsAlerts.map((a) => a.id)))}
              className="text-[11px] font-semibold text-gravl-volt hover:underline disabled:opacity-40"
              disabled={unread === 0}
            >
              Marcar todo como leído
            </button>
          </div>
          <ul className="max-h-[60vh] divide-y divide-white/[0.05] overflow-y-auto">
            {opsAlerts.map((a) => {
              const s = severityStyle[a.severity];
              const Icon = s.icon;
              const isRead = readIds.has(a.id);
              const body = (
                <div className={cn('flex gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]', isRead && 'opacity-55')}>
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${s.color}18`, color: s.color }}
                  >
                    <Icon size={14} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white">{a.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-gravl-text-secondary">{a.detail}</p>
                    <p className="mt-1 text-[10px] text-gravl-text-muted">{fmtRelative(a.timestamp)}</p>
                  </div>
                  {!isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gravl-volt" aria-label="Sin leer" />}
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
  const stats = scopeStats(selectedLocationId);
  const meta = verticalMeta[vertical];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.08] bg-gravl-canvas/85 px-4 backdrop-blur-xl sm:px-6 xl:px-8">
      <button
        onClick={() => setMobileNavOpen(true)}
        aria-label="Abrir menú"
        className="flex h-9 w-9 items-center justify-center rounded-xl text-gravl-text-secondary hover:bg-white/[0.05] hover:text-white lg:hidden"
      >
        <Menu size={18} />
      </button>

      {vertical === 'GYM_CHAIN' ? (
        <div className="flex min-w-0 items-center gap-3">
          <label className="relative flex items-center gap-2 rounded-xl border border-white/[0.08] bg-gravl-raised py-1.5 pl-3 pr-2 transition-colors focus-within:border-gravl-volt/40 hover:border-white/[0.18]">
            <MapPin size={14} className="shrink-0 text-gravl-volt" aria-hidden />
            <span className="sr-only">Sede</span>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="min-w-0 appearance-none bg-transparent pr-5 text-xs font-semibold text-white focus:outline-none"
            >
              <option value="all">Toda la red ({locations.length} sedes)</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2 text-gravl-text-muted" aria-hidden />
          </label>

          <div
            className="hidden items-center gap-2 rounded-full border border-gravl-emerald/20 bg-gravl-emerald/10 px-3 py-1.5 md:flex"
            title={`Ocupación del salón: ${stats.occupancyPct}% de la capacidad cómoda`}
          >
            <LiveDot />
            <span className="whitespace-nowrap text-xs font-semibold text-gravl-text-secondary">
              <span className="tabular-nums font-bold text-gravl-emerald">{stats.liveNow}</span> entrenando ahora
              <span className="ml-1.5 hidden text-gravl-text-muted xl:inline">· {stats.occupancyPct}% ocupación</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
          <meta.icon size={16} style={{ color: meta.color }} aria-hidden />
          <span className="truncate">{meta.label}</span>
        </div>
      )}

      <div className="flex-1" />

      <button
        onClick={() => setCommandOpen(true)}
        className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-gravl-raised px-3 text-xs text-gravl-text-muted transition-colors hover:border-white/[0.18] hover:text-white"
        aria-label="Buscar socios, módulos y acciones"
      >
        <Search size={15} aria-hidden />
        <span className="hidden w-44 text-left md:inline">Buscar socios, acciones…</span>
        <span className="kbd hidden md:inline">⌘K</span>
      </button>

      <NotificationsMenu />

      <div
        className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/[0.12] bg-gradient-to-br from-gravl-cyan/20 to-gravl-volt/20 text-xs font-bold text-white sm:flex"
        title="Admin del partner"
        aria-label="Perfil del administrador"
        role="img"
      >
        LP
      </div>
    </header>
  );
}
