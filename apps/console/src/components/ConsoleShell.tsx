'use client';

import React, { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@gravl/ui';
import { Briefcase, Globe2, LayoutGrid, ShieldAlert } from 'lucide-react';

const nav = [
  { href: '/portfolio', label: 'Portafolio', icon: LayoutGrid },
  { href: '/deal-desk', label: 'Deal Desk', icon: Briefcase },
  { href: '/markets', label: 'Mercados', icon: Globe2 },
];

/**
 * Shell de la consola interna. Se diferencia a propósito del portal del partner:
 * acento cyan, banda de "acceso interno" y sin nada que un partner pueda ver.
 */
export default function ConsoleShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-center gap-2 bg-gravl-cyan/12 px-4 py-1.5 text-[11px] font-semibold text-gravl-cyan">
        <ShieldAlert size={13} aria-hidden />
        Consola interna de GRAVL · acceso con SSO corporativo + MFA · todas las acciones quedan auditadas
      </div>
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-gravl-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-6 px-4 sm:px-6 xl:px-8">
          <Link href="/portfolio" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gravl-cyan text-sm font-black text-gravl-canvas">G</span>
            <span className="text-sm font-black tracking-widest text-white">GRAVL</span>
            <span className="rounded border border-gravl-cyan/30 bg-gravl-cyan/12 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-gravl-cyan">CONSOLE</span>
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
                    active ? 'bg-gravl-cyan/15 text-white' : 'text-gravl-text-secondary hover:bg-white/[0.05] hover:text-white',
                  )}
                >
                  <n.icon size={14} className={active ? 'text-gravl-cyan' : undefined} aria-hidden />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex-1" />
          <span className="hidden text-xs text-gravl-text-muted sm:inline">staff@gravl.ai</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 xl:px-8">{children}</main>
    </div>
  );
}
