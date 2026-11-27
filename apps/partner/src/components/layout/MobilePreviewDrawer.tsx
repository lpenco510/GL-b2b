'use client';

import React, { useLayoutEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { liveWorkoutFeed, locationById, locations, nudgeTemplates } from '@gravl/mock-data';
import { GravlIcon } from '@gravl/ui';
import { useTenant } from './useTenant';
import { Bell, Dumbbell, LineChart, Trophy, User, Users, X } from 'lucide-react';

/**
 * Cómo ve el socio la app con el partner encima. Textos y estructura tomados de las
 * pantallas que muestra gravl.ai (semana, serie en curso, Strength Score); lo que cambia
 * es lo que agrega el B2B: sede, reto del gimnasio, ranking y push con su marca.
 */
export default function MobilePreviewDrawer() {
  const { mobilePreviewOpen, setMobilePreviewOpen, challenges, selectedLocationId } = useApp();
  const tenant = useTenant();
  const location = selectedLocationId === 'all' ? locations[0] : locationById(selectedLocationId) ?? locations[0];
  const challenge = challenges.find((c) => c.status === 'ACTIVE') ?? challenges[0];
  const push = nudgeTemplates[0].body.replace('{gym}', tenant.name).replace('{name}', 'Sofía');
  const feed = liveWorkoutFeed.filter((e) => selectedLocationId === 'all' || e.locationId === selectedLocationId).slice(0, 3);

  useLayoutEffect(() => {
    if (!mobilePreviewOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobilePreviewOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobilePreviewOpen, setMobilePreviewOpen]);

  if (!mobilePreviewOpen) return null;

  return (
    <aside
      aria-label="Vista previa de la app del socio"
      className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-[400px] animate-slide-in-right flex-col border-l border-gravl-line bg-gravl-surface shadow-[-24px_0_60px_-30px_rgba(8,14,24,0.4)]"
    >
      <div className="flex items-center justify-between border-b border-gravl-line px-5 py-4">
        <div>
          <p className="text-[15px] font-semibold text-gravl-text">La app del socio</p>
          <p className="mt-0.5 text-xs text-gravl-text-muted">Con la sede, los retos y los mensajes de {tenant.name}</p>
        </div>
        <button onClick={() => setMobilePreviewOpen(false)} aria-label="Cerrar" className="rounded-lg p-1.5 text-gravl-text-muted transition-colors hover:bg-gravl-text/[0.06] hover:text-gravl-text">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[320px] overflow-hidden rounded-[2.75rem] border-[6px] border-[#16181c] bg-[#0b0b0d] shadow-[0_30px_60px_-20px_rgba(8,14,24,0.55)]">
          <div className="flex items-center justify-between px-6 pb-1 pt-3 text-[11px] font-semibold text-white">
            <span>9:41</span>
            <span className="h-[22px] w-[86px] rounded-full bg-black" />
            <span>100%</span>
          </div>

          <div className="space-y-3 px-4 pb-4 pt-2 text-white">
            {/* Encabezado con co-branding */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GravlIcon size={22} />
                <span className="text-white/30">×</span>
                <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#080e18]">{tenant.shortName}</span>
              </div>
              <span className="text-[11px] text-white/50">{tenant.vertical === 'GYM_CHAIN' ? location.name : tenant.name}</span>
            </div>

            {/* Semana */}
            <div className="rounded-2xl bg-white/[0.06] p-3.5">
              <p className="text-[11px] text-white/50">1 de 4 completados esta semana</p>
              <div className="mt-2 flex gap-1.5" aria-hidden>
                {[1, 0, 0, 0].map((d, i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full ${d ? 'bg-[#d2fe0b]' : 'bg-white/10'}`} />
                ))}
              </div>
              <p className="mt-3 text-[15px] font-semibold">Pecho y espalda a continuación</p>
              <p className="text-[12px] text-white/50">53 min · armado con las máquinas de {location.shortName}</p>
            </div>

            {/* Serie en curso */}
            <div className="rounded-2xl bg-white/[0.06] p-3.5">
              <p className="text-[11px] uppercase tracking-[0.06em] text-white/40">Press de banca</p>
              <p className="mt-1 text-[12px] text-white/50">10 kg calentamiento · registrado</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="font-display text-[34px] font-bold leading-none">
                  22,5 kg <span className="text-white/40">× 10</span>
                </p>
                <span className="rounded-full bg-[#d2fe0b] px-2.5 py-1 text-[11px] font-bold text-[#080e18]">0:14 descanso</span>
              </div>
            </div>

            {/* Strength Score */}
            <div className="flex items-center justify-between rounded-2xl bg-white/[0.06] p-3.5">
              <div>
                <p className="font-display text-[40px] font-bold leading-none">241</p>
                <p className="mt-1 text-[11px] text-white/50">Strength Score</p>
              </div>
              <div className="text-right text-[12px]">
                <p className="font-semibold text-[#d2fe0b]">+4 esta semana</p>
                <p className="text-white/50">9 para Elite</p>
              </div>
            </div>

            {/* Lo que agrega el B2B */}
            {challenge && (
              <div className="rounded-2xl border border-[#d2fe0b]/30 bg-[#d2fe0b]/[0.07] p-3.5">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#d2fe0b]">
                  <Trophy size={11} aria-hidden /> Reto {tenant.name}
                </p>
                <p className="mt-1 text-[13px] font-semibold">{challenge.title}</p>
                <div className="mt-2 h-1.5 rounded-full bg-white/10">
                  <div className="h-1.5 rounded-full bg-[#d2fe0b]" style={{ width: `${Math.min(100, ((challenge.currentValue ?? 0) / challenge.targetValue) * 100)}%` }} />
                </div>
              </div>
            )}

            {feed.length > 0 && (
              <div className="rounded-2xl bg-white/[0.06] p-3.5">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white/40">
                  <Users size={11} aria-hidden /> En tu sede ahora
                </p>
                <ul className="space-y-1.5">
                  {feed.map((e) => (
                    <li key={e.id} className="flex items-center justify-between text-[12px]">
                      <span className="truncate text-white/80">{e.memberName} · {e.exercise}</span>
                      <span className="font-display text-[15px] font-bold">{e.weight} kg{e.isPR && <span className="ml-1 text-[#d2fe0b]">PR</span>}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-2xl bg-white p-3 text-[#080e18]">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#080e18]/50">
                <Bell size={11} aria-hidden /> {tenant.name} · ahora
              </p>
              <p className="mt-1 text-[12px] leading-snug">{push}</p>
            </div>

            <nav className="flex items-center justify-around pt-2" aria-hidden>
              {[
                { l: 'Entrenar', i: Dumbbell, a: true },
                { l: 'Progreso', i: LineChart },
                { l: 'Amigos', i: Users },
                { l: 'Perfil', i: User },
              ].map(({ l, i: Icon, a }) => (
                <span key={l} className="flex flex-col items-center gap-0.5">
                  <Icon size={16} className={a ? 'text-[#d2fe0b]' : 'text-white/40'} />
                  <span className={`text-[9px] ${a ? 'font-semibold text-[#d2fe0b]' : 'text-white/40'}`}>{l}</span>
                </span>
              ))}
            </nav>
          </div>
        </div>
        <p className="mx-auto mt-4 max-w-[320px] text-center text-xs text-gravl-text-muted">
          Lo de arriba es la app de siempre. El reto, la sede en vivo y el mensaje son lo que suma el partner.
        </p>
      </div>
    </aside>
  );
}
