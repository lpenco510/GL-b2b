'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { demoTenants, formCheckInbox, locations, membersInScope, scopeStats } from '@gravl/mock-data';
import { nudgeDecisionFor } from '@gravl/domain';
import { GravlIcon, GravlWordmark, cn } from '@gravl/ui';
import { navByVertical, verticalMeta } from './nav';
import { useSwitchTenant, useTenant } from './useTenant';
import { Check, ChevronLeft, ChevronRight, ChevronsUpDown, Smartphone, X } from 'lucide-react';

function TenantSwitcher({ collapsed }: { collapsed: boolean }) {
  const tenant = useTenant();
  const switchTenant = useSwitchTenant();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Partner actual: ${tenant.name}. Cambiar`}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border border-gravl-line bg-gravl-card p-2 text-left transition-[border-color,box-shadow] duration-200 hover:border-gravl-text/25 hover:shadow-[0_4px_14px_-6px_rgba(8,14,24,0.18)]',
          collapsed && 'justify-center border-transparent bg-transparent p-1',
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gravl-ink text-[12px] font-bold tracking-tight text-white dark:bg-gravl-text dark:text-gravl-ink">
          {tenant.shortName}
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold text-gravl-text">{tenant.name}</span>
              <span className="block truncate text-xs text-gravl-text-muted">{tenant.subtitle}</span>
            </span>
            <ChevronsUpDown size={14} className="shrink-0 text-gravl-text-muted" aria-hidden />
          </>
        )}
      </button>

      {open && (
        <div role="menu" className="gravl-glass absolute left-0 top-full z-50 mt-2 w-64 animate-slide-up p-1.5">
          <p className="gravl-label px-2.5 pb-1.5 pt-1">Partners de demo</p>
          {demoTenants.map((t) => {
            const m = verticalMeta[t.vertical];
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
                className={cn('flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors duration-150', active ? 'bg-gravl-text/[0.06]' : 'hover:bg-gravl-text/[0.04]')}
              >
                <m.icon size={16} className="text-gravl-text-muted" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-gravl-text">{t.name}</span>
                  <span className="block truncate text-[11px] text-gravl-text-muted">{m.label}</span>
                </span>
                {active && <Check size={14} className="text-gravl-text" aria-hidden />}
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
  const tenant = useTenant();

  const badges = useMemo(() => {
    const stats = scopeStats(selectedLocationId, tenant.deal);
    const actionable = membersInScope(selectedLocationId).filter(
      (m) => (m.cancelIntent || m.status === 'AT_RISK') && nudgeDecisionFor(m, tenant.deal, { lastNudgedAt: nudgedAt[m.userId] }).allowed,
    ).length;
    const maintenance = locations.flatMap((l) => l.equipmentProfile.machines).filter((m) => getMachineStatus(m) === 'MAINTENANCE').length;
    return {
      live: { text: String(stats.liveNow), live: true },
      atRisk: { text: String(actionable) },
      maintenance: maintenance ? { text: String(maintenance) } : undefined,
      formChecks: { text: String(formCheckInbox.length) },
    } as Record<string, { text: string; live?: boolean } | undefined>;
  }, [selectedLocationId, getMachineStatus, nudgedAt, tenant]);

  return (
    <>
      <div className={cn('flex h-16 items-center gap-3 px-4', collapsed && 'justify-center px-0')}>
        <GravlIcon size={28} />
        {!collapsed && (
          <span className="flex items-baseline gap-2 text-gravl-text">
            <GravlWordmark height={13} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gravl-text-muted">Partners</span>
          </span>
        )}
      </div>

      <div className="px-3 pb-2">
        <TenantSwitcher collapsed={collapsed} />
      </div>

      <nav aria-label="Módulos" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {navByVertical[tenant.vertical].map((group) => (
          <div key={group.label} className="space-y-0.5">
            {!collapsed && <p className="gravl-label px-3 pb-1.5">{group.label}</p>}
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
                    'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[14px] transition-[background-color,color] duration-200',
                    collapsed && 'justify-center px-0',
                    active
                      ? 'bg-gravl-ink font-semibold text-white dark:bg-gravl-lime dark:text-gravl-ink'
                      : 'font-medium text-gravl-text-secondary hover:bg-gravl-text/[0.05] hover:text-gravl-text',
                  )}
                >
                  <Icon size={18} aria-hidden className={cn('shrink-0 transition-transform duration-200 group-hover:scale-110', active ? '' : 'text-gravl-text-muted group-hover:text-gravl-text')} />
                  {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                  {!collapsed && badge && (
                    <span
                      className={cn(
                        'tabular-nums flex items-center gap-1 rounded-md px-1.5 text-[11px] font-semibold',
                        active ? 'bg-white/15 text-white dark:bg-gravl-ink/15 dark:text-gravl-ink' : 'bg-gravl-text/[0.07] text-gravl-text-secondary',
                      )}
                    >
                      {badge.live && <span className="h-1.5 w-1.5 rounded-full bg-gravl-emerald" />}
                      {badge.text}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-gravl-line p-3">
        <button
          onClick={() => setMobilePreviewOpen(!mobilePreviewOpen)}
          aria-pressed={mobilePreviewOpen}
          title={collapsed ? 'Ver la app del socio' : undefined}
          className={cn(
            'flex h-10 w-full items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors duration-200',
            collapsed && 'justify-center px-0',
            mobilePreviewOpen ? 'bg-gravl-text/[0.07] text-gravl-text' : 'text-gravl-text-secondary hover:bg-gravl-text/[0.05] hover:text-gravl-text',
          )}
        >
          <Smartphone size={18} aria-hidden />
          {!collapsed && <span className="flex-1 text-left">Ver la app del socio</span>}
        </button>
      </div>
    </>
  );
}

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen } = useApp();

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen select-none flex-col border-r border-gravl-line bg-gravl-surface transition-[width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] lg:flex',
          sidebarCollapsed ? 'w-[76px]' : 'w-[264px]',
        )}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
        <div className="px-3 pb-3">
          <button
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            className={cn(
              'flex h-9 w-full items-center gap-3 rounded-xl px-3 text-[13px] text-gravl-text-muted transition-colors hover:bg-gravl-text/[0.05] hover:text-gravl-text',
              sidebarCollapsed && 'justify-center px-0',
            )}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!sidebarCollapsed && <span>Colapsar</span>}
          </button>
        </div>
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-gravl-ink/40 backdrop-blur-[2px]" onClick={() => setMobileNavOpen(false)} aria-hidden />
          <aside className="absolute left-0 top-0 flex h-full w-[284px] max-w-[85vw] animate-slide-in-left flex-col border-r border-gravl-line bg-gravl-surface">
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-gravl-text-muted hover:bg-gravl-text/[0.06] hover:text-gravl-text"
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
