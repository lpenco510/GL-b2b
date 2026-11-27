'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { REFERENCE_NOW, leaderboard, locationName, locations, networkBenchmarks, organization } from '@gravl/mock-data';
import { scopeStats } from '@gravl/mock-data';
import { fmtCompact, fmtDate, fmtInt } from '@gravl/domain';
import { cn } from '@gravl/ui';
import { Avatar, Badge, Button, Card, CardHeader, Field, PageHeader, ProgressBar } from '@gravl/ui';
import { Modal } from '@gravl/ui';
import type { ChallengeMetric, GymChallenge } from '@gravl/domain';
import { Calendar, Dumbbell, Gift, Medal, Plus, Smartphone, Target, TrendingUp, Trophy, Users, type LucideIcon } from 'lucide-react';

const metricMeta: Record<ChallengeMetric, { label: string; desc: string; unit: string; icon: LucideIcon; color: string; defaultTarget: number }> = {
  WORKOUT_COUNT: { label: 'Constancia', desc: 'Cantidad de sesiones', unit: 'sesiones', icon: Target, color: '#C6FF00', defaultTarget: 12 },
  STRENGTH_SCORE_GAIN: { label: 'Fuerza', desc: 'Mejora de Strength Score', unit: 'pts', icon: TrendingUp, color: '#38BDF8', defaultTarget: 20 },
  TOTAL_VOLUME_KG: { label: 'Volumen', desc: 'Kilos colectivos', unit: 'kg', icon: Dumbbell, color: '#F59E0B', defaultTarget: 250_000 },
};

const statusTone = { ACTIVE: 'emerald', UPCOMING: 'cyan', COMPLETED: 'neutral' } as const;
const statusLabel = { ACTIVE: 'Activo', UPCOMING: 'Próximo', COMPLETED: 'Finalizado' } as const;

const isoDay = (offset: number) => new Date(REFERENCE_NOW.getTime() + offset * 86_400_000).toISOString().slice(0, 10);

interface Draft {
  metric: ChallengeMetric;
  title: string;
  target: number;
  start: string;
  end: string;
  reward: string;
  locationIds: string[];
}

const emptyDraft = (focus?: string): Draft => ({
  metric: 'WORKOUT_COUNT',
  title: focus ? `Reto ${focus}: 12 sesiones en 4 semanas` : '',
  target: 12,
  start: isoDay(1),
  end: isoDay(29),
  reward: focus ? `Clase grupal de ${focus.toLowerCase()} + kit de bandas` : '',
  locationIds: [],
});

function validate(d: Draft) {
  const e: Partial<Record<keyof Draft, string>> = {};
  if (d.title.trim().length < 4) e.title = 'Poné un nombre de al menos 4 caracteres.';
  if (!(d.target > 0)) e.target = 'El objetivo tiene que ser mayor a 0.';
  if (!d.start || !d.end || d.end <= d.start) e.end = 'La fecha de fin tiene que ser posterior al inicio.';
  if (d.reward.trim().length < 3) e.reward = 'Contales a los socios qué se ganan.';
  return e;
}

function UrlIntents({ onOpen }: { onOpen: (focus?: string) => void }) {
  const params = useSearchParams();
  const isNew = params.get('new');
  const focus = params.get('focus') ?? undefined;
  useEffect(() => {
    if (isNew) onOpen(focus);
  }, [isNew, focus, onOpen]);
  return null;
}

export default function CommunityPage() {
  const { challenges, addChallenge, addToast, setMobilePreviewOpen, selectedLocationId } = useApp();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [touched, setTouched] = useState(false);
  const errors = validate(draft);
  const stats = scopeStats('all');

  const openWizard = useCallback((focus?: string) => {
    setDraft(emptyDraft(focus));
    setTouched(false);
    setOpen(true);
  }, []);

  const submit = () => {
    setTouched(true);
    if (Object.keys(errors).length) return;
    const startsLater = draft.start > REFERENCE_NOW.toISOString().slice(0, 10);
    const c: GymChallenge = {
      id: `ch_${Date.now()}`,
      organizationId: organization.id,
      title: draft.title.trim(),
      metric: draft.metric,
      targetValue: draft.target,
      startDate: draft.start,
      endDate: draft.end,
      participantsCount: 0,
      rewardDescription: draft.reward.trim(),
      status: startsLater ? 'UPCOMING' : 'ACTIVE',
      currentValue: 0,
      locationIds: draft.locationIds,
    };
    addChallenge(c);
    setOpen(false);
    addToast(`“${c.title}” publicado. Los socios lo ven en la app y reciben un push.`, 'success', {
      label: 'Ver en la app',
      onClick: () => setMobilePreviewOpen(true),
    });
  };

  const board = leaderboard.filter((e) => selectedLocationId === 'all' || e.locationId === selectedLocationId);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <UrlIntents onOpen={openWizard} />
      </Suspense>

      <PageHeader
        title="Comunidad & Retos"
        description="Retos con tu marca que aparecen en la app de cada socio. La competencia sana es la palanca de adherencia más barata que existe."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => openWizard()}>
            Crear reto
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { l: 'Socios en el grupo oficial', v: fmtInt(stats.total), c: '#F8FAFC', i: Users },
          { l: 'Sesiones / semana por socio', v: String(networkBenchmarks.avgWorkoutsPerWeek).replace('.', ','), c: '#C6FF00', i: Target },
          { l: 'Strength Score promedio (30 d)', v: `+${networkBenchmarks.avgStrengthScoreGrowth}`, c: '#38BDF8', i: TrendingUp },
        ].map((s) => (
          <Card key={s.l} className="flex items-center gap-4 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
              <s.i size={18} style={{ color: s.c }} aria-hidden />
            </span>
            <div>
              <p className="tabular-nums text-2xl font-black" style={{ color: s.c }}>{s.v}</p>
              <p className="text-xs text-gravl-text-muted">{s.l}</p>
            </div>
          </Card>
        ))}
      </div>

      <section>
        <CardHeader icon={Trophy} title="Retos" subtitle={`${challenges.filter((c) => c.status === 'ACTIVE').length} activos · ${challenges.filter((c) => c.status === 'UPCOMING').length} próximos`} />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {challenges.map((ch) => {
            const meta = metricMeta[ch.metric];
            const Icon = meta.icon;
            const progress = ch.currentValue ?? 0;
            const daysLeft = Math.max(0, Math.ceil((new Date(`${ch.endDate}T23:59:59-03:00`).getTime() - REFERENCE_NOW.getTime()) / 86_400_000));
            return (
              <Card key={ch.id} interactive className={cn('flex flex-col p-5', ch.status === 'ACTIVE' && 'border-gravl-volt/20')}>
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${meta.color}15`, color: meta.color }}>
                    <Icon size={17} aria-hidden />
                  </span>
                  <Badge tone={statusTone[ch.status]}>{statusLabel[ch.status]}</Badge>
                </div>
                <h4 className="mt-3 text-sm font-bold text-white">{ch.title}</h4>
                <p className="mt-0.5 text-[11px] text-gravl-text-muted">{meta.label} · objetivo {fmtCompact(ch.targetValue)} {meta.unit}</p>

                {ch.status === 'ACTIVE' && (
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-[11px]">
                      <span className="text-gravl-text-secondary">Progreso promedio</span>
                      <span className="tabular-nums font-bold text-gravl-volt">
                        {fmtCompact(progress)} / {fmtCompact(ch.targetValue)}
                      </span>
                    </div>
                    <ProgressBar value={progress} max={ch.targetValue} label={`Progreso de ${ch.title}`} />
                  </div>
                )}

                <ul className="mt-4 flex-1 space-y-2 text-xs text-gravl-text-secondary">
                  <li className="flex items-center gap-2">
                    <Calendar size={12} aria-hidden /> {fmtDate(ch.startDate + 'T12:00:00-03:00')} → {fmtDate(ch.endDate + 'T12:00:00-03:00')}
                    {ch.status === 'ACTIVE' && <span className="text-gravl-text-muted">· quedan {daysLeft} días</span>}
                  </li>
                  <li className="flex items-center gap-2">
                    <Users size={12} aria-hidden /> <span className="tabular-nums">{fmtInt(ch.participantsCount)}</span> participantes
                  </li>
                  <li className="flex items-start gap-2">
                    <Gift size={12} className="mt-0.5 shrink-0" aria-hidden /> {ch.rewardDescription}
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/[0.05] pt-3">
                  {(ch.locationIds?.length ? ch.locationIds : ['all']).map((id) => (
                    <Badge key={id}>{id === 'all' ? 'Toda la red' : locationName(id)}</Badge>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <Card className="p-5 sm:p-6">
        <CardHeader
          icon={Medal}
          title="Ranking del mes"
          subtitle={selectedLocationId === 'all' ? 'Toda la red' : `Filtrado por ${locationName(selectedLocationId)}`}
          action={
            <Button size="sm" variant="ghost" icon={Smartphone} onClick={() => setMobilePreviewOpen(true)}>
              Ver en la app
            </Button>
          }
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <caption className="sr-only">Ranking mensual por Strength Score</caption>
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">
                <th scope="col" className="px-3 py-3">#</th>
                <th scope="col" className="px-3 py-3">Socio</th>
                <th scope="col" className="px-3 py-3">Strength Score</th>
                <th scope="col" className="px-3 py-3">Δ 30 d</th>
                <th scope="col" className="px-3 py-3">Sesiones</th>
                <th scope="col" className="px-3 py-3 text-right">Volumen</th>
              </tr>
            </thead>
            <tbody>
              {board.map((e) => (
                <tr key={e.rank} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        'tabular-nums inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black',
                        e.rank === 1 && 'bg-gravl-volt text-gravl-canvas',
                        e.rank === 2 && 'bg-slate-300 text-gravl-canvas',
                        e.rank === 3 && 'bg-amber-600 text-white',
                        e.rank > 3 && 'bg-white/[0.05] text-gravl-text-secondary',
                      )}
                    >
                      {e.rank}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-2.5">
                      <Avatar name={e.name} size={28} />
                      <span>
                        <span className="block text-sm font-semibold text-white">{e.name}</span>
                        <span className="block text-[10px] text-gravl-text-muted">{locationName(e.locationId)}</span>
                      </span>
                    </span>
                  </td>
                  <td className="tabular-nums px-3 py-3 text-sm font-bold text-gravl-cyan">{e.strengthScore}</td>
                  <td className="tabular-nums px-3 py-3 text-sm font-semibold text-gravl-emerald">+{e.delta}</td>
                  <td className="tabular-nums px-3 py-3 text-sm text-white">{e.workouts}</td>
                  <td className="tabular-nums px-3 py-3 text-right text-sm text-gravl-text-secondary">{fmtInt(e.volume)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Crear reto"
        description="Se publica en la app de los socios de las sedes elegidas, con push de lanzamiento."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="primary" icon={Trophy} onClick={submit}>Publicar reto</Button>
          </>
        }
      >
        <div className="space-y-5">
          <div role="radiogroup" aria-label="Tipo de reto" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(Object.keys(metricMeta) as ChallengeMetric[]).map((k) => {
              const m = metricMeta[k];
              const active = draft.metric === k;
              return (
                <button
                  key={k}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDraft((d) => ({ ...d, metric: k, target: m.defaultTarget }))}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors sm:flex-col sm:items-start',
                    active ? 'border-gravl-volt/50 bg-gravl-volt/[0.07]' : 'border-white/[0.08] hover:border-white/[0.16]',
                  )}
                >
                  <m.icon size={18} style={{ color: m.color }} aria-hidden />
                  <span>
                    <span className="block text-sm font-bold text-white">{m.label}</span>
                    <span className="block text-[11px] text-gravl-text-muted">{m.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <Field label="Nombre del reto" htmlFor="ch-title" error={touched ? errors.title : undefined}>
            <input
              id="ch-title"
              data-autofocus
              value={draft.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Ej.: 16 entrenamientos en 30 días"
              aria-invalid={touched && !!errors.title}
              className="gravl-input"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label={`Objetivo (${metricMeta[draft.metric].unit})`} htmlFor="ch-target" error={touched ? errors.target : undefined}>
              <input
                id="ch-target"
                type="number"
                min={1}
                value={draft.target}
                onChange={(e) => set('target', Number(e.target.value))}
                aria-invalid={touched && !!errors.target}
                className="gravl-input tabular-nums"
              />
            </Field>
            <Field label="Inicio" htmlFor="ch-start">
              <input id="ch-start" type="date" value={draft.start} onChange={(e) => set('start', e.target.value)} className="gravl-input" />
            </Field>
            <Field label="Fin" htmlFor="ch-end" error={touched ? errors.end : undefined}>
              <input id="ch-end" type="date" value={draft.end} onChange={(e) => set('end', e.target.value)} aria-invalid={touched && !!errors.end} className="gravl-input" />
            </Field>
          </div>

          <Field label="Premio" htmlFor="ch-reward" error={touched ? errors.reward : undefined}>
            <input
              id="ch-reward"
              value={draft.reward}
              onChange={(e) => set('reward', e.target.value)}
              placeholder="Ej.: mes gratis, pack de proteína, merch…"
              aria-invalid={touched && !!errors.reward}
              className="gravl-input"
            />
          </Field>

          <fieldset>
            <legend className="mb-1.5 text-xs font-semibold text-gravl-text-secondary">Sedes</legend>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={draft.locationIds.length === 0}
                onClick={() => set('locationIds', [])}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                  draft.locationIds.length === 0 ? 'border-gravl-volt/50 bg-gravl-volt/10 text-gravl-volt' : 'border-white/[0.1] text-gravl-text-secondary hover:text-white',
                )}
              >
                Toda la red
              </button>
              {locations.map((l) => {
                const on = draft.locationIds.includes(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set('locationIds', on ? draft.locationIds.filter((x) => x !== l.id) : [...draft.locationIds, l.id])}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                      on ? 'border-gravl-volt/50 bg-gravl-volt/10 text-gravl-volt' : 'border-white/[0.1] text-gravl-text-secondary hover:text-white',
                    )}
                  >
                    {l.shortName}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
      </Modal>
    </div>
  );
}
