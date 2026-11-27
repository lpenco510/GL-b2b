'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { cn } from '@gravl/ui';
import { demoTenants, formCheckInbox, locations } from '@gravl/mock-data';
import { monetizationLabel } from '@gravl/domain';
import { membersInScope, scopeStats } from '@gravl/mock-data';
import { navByVertical, verticalMeta } from './nav';
import { useSwitchTenant, useTenant, useVertical } from './useTenant';
import { Check, ChevronLeft, ChevronRight, ChevronsUpDown, Smartphone, X } from 'lucide-react';

function TenantSwitcher({ collapsed }: { collapsed: boolean }) {
  const tenant = useTenant();
  const switchTenant = useSwitchTenant();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const meta = { color: tenant.accent };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
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
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Workspace actual: ${tenant.name}. Cambiar workspace`}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.04]',
          collapsed && 'justify-center',
        )}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black text-gravl-canvas"
          style={{ background: meta.color, boxShadow: `0 0 18px ${meta.color}55` }}
        >
          {tenant.shortName}
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-white">{tenant.name}</span>
              <span className="block truncate text-[11px] text-gravl-text-muted">{tenant.subtitle}</span>
            </span>
            <ChevronsUpDown size={14} className="shrink-0 text-gravl-text-muted" aria-hidden />
          </>
        )}
      </button>

      {open && (
        <div role="menu" className="gravl-glass absolute left-0 top-full z-50 mt-2 w-64 animate-slide-up p-1.5">
          <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">
            Workspaces de demo
          </p>
          {demoTenants.map((t) => {
            const m = verticalMeta[t.vertical];
            const Icon = m.icon;
            const active = t.id === tenant.id;
            return (
              <button
                key={t.id}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setOpen(false);
                  if (!active) switchTenant(t);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors',
                  active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]',
                )}
              >
                <Icon size={16} style={{ color: t.accent }} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-white">{t.name}</span>
                  <span className="block truncate text-[10px] text-gravl-text-muted">
                    {m.label} · {monetizationLabel[t.deal.monetization]}
                  </span>
                </span>
                {active && <Check size={14} className="text-gravl-volt" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { selectedLocationId, getMachineStatus, nudgedAt, mobilePreviewOpen, setMobilePreviewOpen } = useApp();
  const pathname = usePathname();
  const vertical = useVertical();
  const tenant = useTenant();

  const badges = useMemo(() => {
    const stats = scopeStats(selectedLocationId);
    const maintenance = locations
      .flatMap((l) => l.equipmentProfile.machines)
      .filter((m) => getMachineStatus(m) === 'MAINTENANCE').length;
    return {
      live: { text: String(stats.liveNow), tone: 'live' as const },
      atRisk: {
        // En débito automático lo urgente es la intención de baja, no la inactividad.
        text: String(
          membersInScope(selectedLocationId).filter((m) =>
            (tenant.deal.monetization === 'BREAKAGE' ? !!m.cancelIntent : m.status === 'AT_RISK') && !nudgedAt[m.userId],
          ).length,
        ),
        tone: 'crimson' as const,
      },
      maintenance: maintenance ? { text: String(maintenance), tone: 'amber' as const } : undefined,
      formChecks: { text: String(formCheckInbox.length), tone: 'amber' as const },
    };
  }, [selectedLocationId, getMachineStatus, nudgedAt, tenant]);

  return (
    <>
      <div className="border-b border-white/[0.07] px-3 py-3">
        <TenantSwitcher collapsed={collapsed} />
      </div>

      <nav aria-label="Módulos" className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {navByVertical[vertical].map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed && (
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">{group.label}</p>
            )}
            {group.items.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + '/');
              const Icon = item.icon;
              const badge = item.badgeKey ? badges[item.badgeKey] : undefined;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[13px] transition-colors',
                    collapsed && 'justify-center px-0',
                    active
                      ? 'border-gravl-volt/25 bg-gradient-to-r from-gravl-volt/[0.14] to-gravl-volt/[0.03] font-semibold text-white'
                      : 'border-transparent font-medium text-gravl-text-secondary hover:bg-white/[0.04] hover:text-white',
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gravl-volt shadow-[0_0_10px_#C6FF00]" />
                  )}
                  <Icon
                    size={18}
                    aria-hidden
                    className={cn('shrink-0', active ? 'text-gravl-volt' : 'text-gravl-text-muted group-hover:text-white')}
                  />
                  {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                  {!collapsed && badge && (
                    <span
                      className={cn(
                        'tabular-nums rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                        badge.tone === 'live' && 'bg-gravl-emerald/15 text-gravl-emerald',
                        badge.tone === 'crimson' && 'bg-gravl-crimson/15 text-rose-300',
                        badge.tone === 'amber' && 'bg-gravl-amber/15 text-gravl-amber',
                      )}
                    >
                      {badge.text}
                    </span>
                  )}
                  {collapsed && badge && (
                    <span
                      className={cn(
                        'absolute right-2 top-2 h-1.5 w-1.5 rounded-full',
                        badge.tone === 'live' ? 'bg-gravl-emerald' : badge.tone === 'crimson' ? 'bg-gravl-crimson' : 'bg-gravl-amber',
                      )}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="space-y-1.5 border-t border-white/[0.07] p-3">
        <button
          onClick={() => setMobilePreviewOpen(!mobilePreviewOpen)}
          aria-pressed={mobilePreviewOpen}
          title={collapsed ? 'Preview de la app del socio' : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors',
            collapsed && 'justify-center px-0',
            mobilePreviewOpen
              ? 'border-gravl-cyan/30 bg-gravl-cyan/12 text-gravl-cyan'
              : 'border-white/[0.06] text-gravl-text-secondary hover:bg-white/[0.04] hover:text-white',
          )}
        >
          <Smartphone size={17} aria-hidden />
          {!collapsed && <span className="flex-1 text-left">Preview app del socio</span>}
        </button>
      </div>
    </>
  );
}

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen } = useApp();

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen select-none flex-col border-r border-white/[0.08] bg-gradient-to-b from-[#0E1219]/95 to-[#090C11]/98 backdrop-blur-xl transition-[width] duration-300 lg:flex',
          sidebarCollapsed ? 'w-[76px]' : 'w-[260px]',
        )}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
        <div className="px-3 pb-3">
          <button
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-gravl-text-muted transition-colors hover:bg-white/[0.04] hover:text-white',
              sidebarCollapsed && 'justify-center px-0',
            )}
          >
            {sidebarCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            {!sidebarCollapsed && <span>Colapsar menú</span>}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/60" onClick={() => setMobileNavOpen(false)} aria-hidden />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] max-w-[85vw] animate-slide-in-left flex-col border-r border-white/[0.08] bg-[#0B0E14]">
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-gravl-text-muted hover:bg-white/[0.06] hover:text-white"
            >
              <X size={16} />
            </button>
            <SidebarContent collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
