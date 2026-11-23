'use client';

import React, { useLayoutEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { liveWorkoutFeed, locationById, locations, nudgeTemplates, tenantsByVertical } from '@/data/mockGravlB2B';
import { useVertical } from './useVertical';
import { Bell, Dumbbell, Flame, Home, LineChart, Smartphone, Trophy, User, Users, X } from 'lucide-react';

/**
 * Preview en vivo de cómo ve el socio la app con la marca del partner.
 * Lee el mismo estado que el panel: si creás un reto o cambiás de sede,
 * el teléfono lo refleja al instante — es el "momento wow" de la demo.
 */
export default function MobilePreviewDrawer() {
  const { mobilePreviewOpen, setMobilePreviewOpen, challenges, selectedLocationId } = useApp();
  const vertical = useVertical();
  const tenant = tenantsByVertical[vertical];
  const location = selectedLocationId === 'all' ? locations[0] : locationById(selectedLocationId) ?? locations[0];
  const challenge = challenges.find((c) => c.status === 'ACTIVE') ?? challenges[0];
  const push = nudgeTemplates[0].body.replace('{gym}', tenant.name).replace('{name}', 'Sofía');
  const feed = liveWorkoutFeed.filter((e) => selectedLocationId === 'all' || e.locationId === selectedLocationId).slice(0, 3);

  // Cerrar con Esc
  useLayoutEffect(() => {
    if (!mobilePreviewOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobilePreviewOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobilePreviewOpen, setMobilePreviewOpen]);

  if (!mobilePreviewOpen) return null;

  return (
    <aside
      aria-label="Preview de la app del socio"
      className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-[400px] animate-slide-in-right flex-col border-l border-white/[0.09] bg-[#0A0C10]/96 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-white">
            <Smartphone size={16} className="text-gravl-cyan" aria-hidden />
            App del socio · en vivo
          </p>
          <p className="mt-0.5 text-[11px] text-gravl-text-muted">Refleja la marca, la sede y los retos que configurás</p>
        </div>
        <button
          onClick={() => setMobilePreviewOpen(false)}
          aria-label="Cerrar preview"
          className="rounded-lg p-1.5 text-gravl-text-muted hover:bg-white/[0.06] hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mx-auto max-w-[320px] overflow-hidden rounded-[2.6rem] border-[3px] border-white/[0.12] bg-black shadow-[0_0_60px_rgba(0,0,0,0.6)]">
          <div className="flex justify-center pb-2 pt-3">
            <div className="h-[30px] w-[110px] rounded-full border border-white/[0.05] bg-black" />
          </div>

          <div className="space-y-3 bg-[#0A0C10] px-4 pb-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-bold text-white">Hola, Sofía 👋</p>
                <p className="text-[11px] text-gravl-text-muted">Hoy toca: Lower A · 52 min</p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gravl-volt/20 text-[11px] font-bold text-gravl-volt">SM</span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gravl-volt text-[9px] font-black text-gravl-canvas">
                {tenant.shortName}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">{tenant.name}</p>
                <p className="truncate text-[10px] text-gravl-text-muted">
                  {vertical === 'GYM_CHAIN' ? `${location.name} · ` : ''}GRAVL Pro activo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
              <div className="relative h-20 w-20 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.06)" strokeWidth="9" fill="none" />
                  <circle cx="50" cy="50" r="42" stroke="#38BDF8" strokeWidth="9" fill="none" strokeDasharray={`${0.78 * 264} 264`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="tabular-nums text-lg font-bold text-gravl-cyan">245</span>
                  <span className="text-[8px] text-gravl-text-muted">Strength</span>
                </div>
              </div>
              <div className="min-w-0 space-y-1.5">
                <p className="text-[11px] font-semibold text-gravl-emerald">+14 pts este mes ↑</p>
                <p className="flex items-center gap-1 text-[11px] text-white">
                  <Flame size={12} className="text-gravl-amber" aria-hidden /> Racha de 8 semanas
                </p>
                <div className="flex gap-1" aria-label="3 de 4 entrenamientos esta semana">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className={`h-1.5 w-6 rounded-full ${i < 3 ? 'bg-gravl-volt' : 'bg-white/[0.08]'}`} />
                  ))}
                </div>
              </div>
            </div>

            {challenge && (
              <div className="rounded-xl border border-gravl-volt/25 bg-gravl-volt/[0.05] p-3">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-gravl-volt">
                  <Trophy size={11} aria-hidden /> Reto {challenge.status === 'ACTIVE' ? 'activo' : 'próximo'}
                </p>
                <p className="mt-1 text-xs font-semibold text-white">{challenge.title}</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/[0.06]">
                  <div
                    className="h-1.5 rounded-full bg-gravl-volt"
                    style={{ width: `${Math.min(100, ((challenge.currentValue ?? 0) / challenge.targetValue) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-gravl-text-muted">{challenge.rewardDescription}</p>
              </div>
            )}

            {feed.length > 0 && (
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-gravl-text-secondary">
                  <Users size={11} aria-hidden /> Tu gimnasio ahora
                </p>
                <ul className="space-y-1.5">
                  {feed.map((evt) => (
                    <li key={evt.id} className="flex items-center gap-2 text-[10px] text-gravl-text-secondary">
                      <Dumbbell size={10} className="shrink-0 text-gravl-text-muted" aria-hidden />
                      <span className="truncate">
                        <span className="font-medium text-white">{evt.memberName}</span> {evt.exercise}{' '}
                        <span className="tabular-nums font-semibold text-white">{evt.weight} {evt.unit}</span>
                        {evt.isPR && <span className="ml-1 text-gravl-volt">PR 🏆</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-xl border border-gravl-cyan/25 bg-gravl-cyan/[0.05] p-3">
              <p className="mb-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-gravl-cyan">
                <Bell size={11} aria-hidden /> Push de {tenant.name}
              </p>
              <p className="text-[11px] leading-snug text-white">{push}</p>
            </div>

            <nav className="flex items-center justify-around border-t border-white/[0.06] pt-3" aria-hidden>
              {[
                { l: 'Entrenar', i: Home, a: true },
                { l: 'Progreso', i: LineChart },
                { l: 'Social', i: Users },
                { l: 'Perfil', i: User },
              ].map(({ l, i: Icon, a }) => (
                <span key={l} className="flex flex-col items-center gap-0.5">
                  <Icon size={15} className={a ? 'text-gravl-volt' : 'text-gravl-text-muted'} />
                  <span className={`text-[8px] ${a ? 'font-semibold text-gravl-volt' : 'text-gravl-text-muted'}`}>{l}</span>
                </span>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}
