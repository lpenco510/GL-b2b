'use client';

import React, { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GravlIcon, GravlWordmark, ThemeToggle, cn } from '@gravl/ui';
import { Briefcase, Cable, Globe2, LayoutGrid, LogOut, ShieldAlert } from 'lucide-react';

const nav = [
  { href: '/portfolio', label: 'Portafolio', icon: LayoutGrid },
  { href: '/deal-desk', label: 'Deal Desk', icon: Briefcase },
  { href: '/markets', label: 'Mercados', icon: Globe2 },
  { href: '/integration', label: 'Integración GRAVL', icon: Cable },
];

/**
 * Shell de la consola interna. Se diferencia a propósito del portal del partner:
 * acento cyan, banda de "acceso interno" y sin nada que un partner pueda ver.
 */
export default function ConsoleShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-center gap-2 bg-gravl-ink px-4 py-1.5 text-[11px] font-semibold text-white/70">
        <ShieldAlert size={13} aria-hidden />
        Consola interna de GRAVL · acceso con SSO corporativo + MFA · todas las acciones quedan auditadas
      </div>
      <header className="sticky top-0 z-30 border-b border-gravl-text/[0.08] bg-gravl-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-6 px-4 sm:px-6 xl:px-8">
          <Link href="/portfolio" className="flex items-center gap-2.5">
            <GravlIcon size={28} />
            <span className="text-gravl-text"><GravlWordmark height={13} /></span>
            <span className="rounded-md bg-gravl-ink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-gravl-lime dark:bg-gravl-lime dark:text-gravl-ink">Console</span>
          </Link>
          <nav aria-label="Secciones" className="flex items-center gap-1 overflow-x-auto">
            {nav.map((n) => {
              const active = pathname?.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                    active ? 'bg-gravl-ink text-white dark:bg-gravl-lime dark:text-gravl-ink' : 'text-gravl-text-secondary hover:bg-gravl-text/[0.05] hover:text-gravl-text',
                  )}
                >
                  <n.icon size={14} aria-hidden />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex-1" />
          <span className="hidden text-xs text-gravl-text-muted sm:inline">staff@gravl.ai</span>
          <ThemeToggle />
          <form action="/api/auth/logout" method="post">
            <button type="submit" aria-label="Cerrar sesión" title="Cerrar sesión" className="flex h-9 w-9 items-center justify-center rounded-xl text-gravl-text-secondary transition-colors hover:bg-gravl-text/[0.06] hover:text-gravl-text">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 xl:px-8">{children}</main>
    </div>
  );
}
