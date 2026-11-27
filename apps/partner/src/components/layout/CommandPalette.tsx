'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { members, locationName } from '@gravl/mock-data';
import { cn } from '@gravl/ui';
import { Avatar } from '@gravl/ui';
import { allNavItems, verticalMeta } from './nav';
import { tenantForVertical } from './useTenant';
import type { VerticalType } from '@gravl/domain';
import { CornerDownLeft, Plus, Search, Send, Smartphone, type LucideIcon } from 'lucide-react';

interface Entry {
  id: string;
  group: 'Acciones' | 'Módulos' | 'Socios';
  label: string;
  hint?: string;
  icon?: LucideIcon;
  avatar?: string;
  run: () => void;
}

const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export default function CommandPalette() {
  const { commandOpen, setCommandOpen, setMobilePreviewOpen, setTenantId } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Atajo global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commandOpen, setCommandOpen]);

  const close = () => {
    setCommandOpen(false);
    setQuery('');
    setCursor(0);
  };

  const go = (href: string, vertical?: VerticalType) => {
    if (vertical) setTenantId(tenantForVertical(vertical).id);
    router.push(href);
  };

  const entries = useMemo<Entry[]>(() => {
    const q = normalize(query.trim());
    const actions: Entry[] = [
      { id: 'a-nudge', group: 'Acciones', label: 'Enviar nudges a socios en riesgo', hint: 'Retención', icon: Send, run: () => go('/retention?segment=AT_RISK', 'GYM_CHAIN') },
      { id: 'a-challenge', group: 'Acciones', label: 'Crear un reto nuevo', hint: 'Comunidad', icon: Plus, run: () => go('/community?new=1') },
      { id: 'a-preview', group: 'Acciones', label: 'Abrir preview de la app del socio', icon: Smartphone, run: () => setMobilePreviewOpen(true) },
    ];
    const pages: Entry[] = allNavItems.map((n) => ({
      id: `p-${n.href}`,
      group: 'Módulos',
      label: n.label,
      hint: verticalMeta[n.vertical].label,
      icon: n.icon,
      run: () => go(n.href, n.vertical),
    }));
    const match = (e: Entry, extra = '') => !q || normalize(`${e.label} ${e.hint ?? ''} ${extra}`).includes(q);

    const out = [
      ...actions.filter((a) => match(a)),
      ...pages.filter((p) => match(p, allNavItems.find((n) => `p-${n.href}` === p.id)?.keywords)),
    ];
    if (q.length >= 2) {
      const found = members.filter((m) => normalize(m.fullName).includes(q)).slice(0, 6);
      out.push(
        ...found.map<Entry>((m) => ({
          id: `m-${m.userId}`,
          group: 'Socios',
          label: m.fullName,
          hint: `${locationName(m.locationId)} · SS ${m.strengthScore}`,
          avatar: m.fullName,
          run: () => go(`/retention?member=${m.userId}`, 'GYM_CHAIN'),
        })),
      );
    }
    return out;
    // go/setMobilePreviewOpen son estables a efectos de la búsqueda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (commandOpen) requestAnimationFrame(() => inputRef.current?.focus());
  }, [commandOpen]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${cursor}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  if (!commandOpen || typeof document === 'undefined') return null;

  const runAt = (i: number) => {
    const e = entries[i];
    if (!e) return;
    close();
    e.run();
  };

  let lastGroup = '';
  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm" onClick={close} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Paleta de comandos" className="gravl-glass relative w-full max-w-xl animate-slide-up overflow-hidden">
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4">
          <Search size={16} className="text-gravl-text-muted" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setCursor((c) => Math.min(entries.length - 1, c + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setCursor((c) => Math.max(0, c - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                runAt(cursor);
              } else if (e.key === 'Escape') {
                close();
              }
            }}
            placeholder="Buscá un socio, un módulo o una acción…"
            aria-label="Buscar"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={entries[cursor] ? `cmdk-${entries[cursor].id}` : undefined}
            className="h-14 flex-1 bg-transparent text-sm text-white placeholder:text-gravl-text-muted focus:outline-none"
          />
          <span className="kbd">Esc</span>
        </div>
        <ul id="cmdk-list" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
          {entries.length === 0 && (
            <li className="px-3 py-8 text-center text-xs text-gravl-text-muted">Sin resultados para “{query}”.</li>
          )}
          {entries.map((e, i) => {
            const header = e.group !== lastGroup ? e.group : null;
            lastGroup = e.group;
            const Icon = e.icon;
            return (
              <React.Fragment key={e.id}>
                {header && (
                  <li role="presentation" className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted first:pt-1">
                    {header}
                  </li>
                )}
                <li
                  id={`cmdk-${e.id}`}
                  role="option"
                  aria-selected={i === cursor}
                  data-idx={i}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => runAt(i)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm',
                    i === cursor ? 'bg-white/[0.07] text-white' : 'text-gravl-text-secondary',
                  )}
                >
                  {e.avatar ? (
                    <Avatar name={e.avatar} size={24} className="rounded-lg" />
                  ) : (
                    Icon && <Icon size={16} className={i === cursor ? 'text-gravl-volt' : 'text-gravl-text-muted'} aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 truncate">{e.label}</span>
                  {e.hint && <span className="shrink-0 text-[11px] text-gravl-text-muted">{e.hint}</span>}
                  {i === cursor && <CornerDownLeft size={13} className="shrink-0 text-gravl-text-muted" aria-hidden />}
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
