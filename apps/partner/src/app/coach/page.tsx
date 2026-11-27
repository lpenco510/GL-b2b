'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { coachClients, formCheckInbox } from '@gravl/mock-data';
import { coachTier, fmtRelative } from '@gravl/domain';
import { cn } from '@gravl/ui';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, Field, KpiTile, PageHeader, ProgressBar, Sparkline } from '@gravl/ui';
import { Modal } from '@gravl/ui';
import type { CoachClient, FormCheck } from '@gravl/domain';
import { AlertTriangle, Calendar, CheckCircle2, Dumbbell, Flame, GraduationCap, Layers, PlayCircle, Send, TrendingUp, Users, Video } from 'lucide-react';

const rpeTone = { Fácil: 'emerald', Ideal: 'cyan', Duro: 'crimson' } as const;
const quickTags = ['Buena profundidad', 'Bracing más firme', 'Codos adentro', 'Bajá 5% la carga', 'Tempo más lento'];
const templates = [
  { name: 'Fuerza 5x5', weeks: 6, focus: 'Básicos pesados, progresión lineal', clients: 2 },
  { name: 'Hipertrofia A/B', weeks: 8, focus: 'Volumen alto, RIR 1–2', clients: 1 },
  { name: 'Powerbuilding', weeks: 10, focus: 'Fuerza + accesorios', clients: 1 },
];

const sumE1rm = (c: CoachClient) => c.squat1RM + c.bench1RM + c.deadlift1RM;

export default function CoachPage() {
  const { addToast } = useApp();
  const [inbox, setInbox] = useState<FormCheck[]>(formCheckInbox);
  const [reviewing, setReviewing] = useState<FormCheck | null>(null);
  const [feedback, setFeedback] = useState('');
  const flagged = coachClients.filter((c) => c.adherence < 70 || c.e1rmTrend[c.e1rmTrend.length - 1] < c.e1rmTrend[0]);
  const avgAdherence = Math.round(coachClients.reduce((a, c) => a + c.adherence, 0) / coachClients.length);

  const sendReview = () => {
    if (!reviewing) return;
    setInbox((prev) => prev.filter((f) => f.id !== reviewing.id));
    addToast(`Corrección enviada a ${reviewing.clientName}. Le llega en la app junto al video.`, 'success');
    setReviewing(null);
    setFeedback('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coach Studio"
        badge={<Badge tone="ink">Tramo {coachTier(24).label} · hasta {coachTier(24).upTo} clientes</Badge>}
        description="Tus clientes, su progreso de 1RM y su feedback de esfuerzo en un solo lugar. GRAVL ajusta las cargas diarias; vos te enfocás en coachear."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile label="Clientes activos" value="24" delta="+3 este mes" hint="Capacidad del plan: 30" icon={Users} color="var(--color-gravl-violet)" />
        <KpiTile label="Sesiones esta semana" value="18" delta="de 22 planificadas" deltaDirection="none" hint="Registradas en la app" icon={Calendar} color="var(--color-gravl-cyan)" />
        <KpiTile label="Adherencia promedio" value={`${avgAdherence}%`} delta="+4 pts vs. mes anterior" hint="Sesiones hechas / planificadas" icon={TrendingUp} color="var(--color-gravl-emerald)" />
        <KpiTile label="Form checks" value={String(inbox.length)} delta={inbox.length ? 'pendientes de revisión' : 'al día'} deltaDirection="none" hint="Videos enviados por clientes" icon={Video} color="var(--color-gravl-amber)" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="p-5 sm:p-6 xl:col-span-5">
          <CardHeader icon={Video} iconColor="var(--color-gravl-amber)" title="Form checks" subtitle="Ordenados por antigüedad. Respondé en menos de 24 h." />
          <ul className="mt-4 space-y-2">
            {inbox.length === 0 && <EmptyState icon={CheckCircle2} title="Inbox en cero" description="Respondiste todos los videos. 💪" />}
            {inbox.map((f) => (
              <li key={f.id} className="flex items-center gap-3 rounded-xl border border-gravl-text/[0.06] bg-gravl-text/[0.02] p-3">
                <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gravl-text/[0.08] to-gravl-text/[0.02]">
                  <PlayCircle size={20} className="text-gravl-text/70" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gravl-text">{f.clientName}</p>
                  <p className="truncate text-[11px] text-gravl-text-secondary">
                    {f.exercise} · {f.load} · <span className="text-gravl-text-muted">{fmtRelative(f.submittedAt)}</span>
                  </p>
                  <p className="mt-0.5 truncate text-[11px] italic text-gravl-text-muted">“{f.note}”</p>
                </div>
                <Button size="sm" variant="soft" onClick={() => setReviewing(f)}>
                  Revisar
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card glow="crimson" className="p-5 sm:p-6 xl:col-span-7">
          <CardHeader icon={AlertTriangle} iconColor="var(--color-gravl-crimson)" title="Clientes que necesitan tu atención" subtitle="Adherencia < 70% o fuerza estimada en baja." />
          <ul className="mt-4 space-y-2">
            {flagged.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gravl-crimson/15 bg-gravl-crimson/[0.04] p-3">
                <Avatar name={c.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gravl-text">{c.name}</p>
                  <p className="text-[11px] text-gravl-text-secondary">
                    Adherencia {c.adherence}% · e1RM total {c.e1rmTrend[0]} → {c.e1rmTrend[c.e1rmTrend.length - 1]} kg · “{c.lastFeedback}”
                  </p>
                </div>
                <Button size="sm" icon={Send} onClick={() => addToast(`Deload de 1 semana asignado a ${c.name} y mensaje enviado.`, 'success')}>
                  Asignar deload
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <CardHeader icon={GraduationCap} iconColor="var(--color-gravl-violet)" title="Clientes" subtitle="1RM actuales y tendencia de fuerza total estimada (6 semanas)." />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <caption className="sr-only">Clientes del coach</caption>
            <thead>
              <tr className="border-b border-gravl-text/[0.06] text-left text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">
                <th scope="col" className="px-3 py-3">Cliente</th>
                <th scope="col" className="px-3 py-3">Plan</th>
                <th scope="col" className="px-3 py-3">SQ / BP / DL</th>
                <th scope="col" className="px-3 py-3">Tendencia</th>
                <th scope="col" className="px-3 py-3">Adherencia</th>
                <th scope="col" className="px-3 py-3">RPE</th>
                <th scope="col" className="px-3 py-3">Racha</th>
                <th scope="col" className="px-3 py-3">Próxima</th>
              </tr>
            </thead>
            <tbody>
              {coachClients.map((c) => {
                const up = c.e1rmTrend[c.e1rmTrend.length - 1] >= c.e1rmTrend[0];
                return (
                  <tr key={c.id} className="border-b border-gravl-text/[0.03] hover:bg-gravl-text/[0.02]">
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-2.5">
                        <Avatar name={c.name} size={30} />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gravl-text">{c.name}</span>
                          <span className="block max-w-[180px] truncate text-[10px] italic text-gravl-text-muted">“{c.lastFeedback}”</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gravl-text-secondary">{c.plan}</td>
                    <td className="tabular-nums px-3 py-3 text-xs font-semibold text-gravl-text">
                      {c.squat1RM} / {c.bench1RM} / {c.deadlift1RM}
                      <span className="ml-1.5 text-gravl-text-muted">= {sumE1rm(c)} kg</span>
                    </td>
                    <td className="px-3 py-3">
                      <Sparkline points={c.e1rmTrend} color={up ? 'var(--color-gravl-emerald)' : 'var(--color-gravl-crimson)'} width={80} height={26} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex w-28 items-center gap-2">
                        <ProgressBar value={c.adherence} color={c.adherence >= 85 ? 'var(--color-gravl-emerald)' : c.adherence >= 70 ? 'var(--color-gravl-amber)' : 'var(--color-gravl-crimson)'} label={`Adherencia ${c.adherence}%`} />
                        <span className="tabular-nums w-8 text-right text-[11px] text-gravl-text-secondary">{c.adherence}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><Badge tone={rpeTone[c.rpe]}>{c.rpe}</Badge></td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-1 text-xs font-semibold text-gravl-text">
                        <Flame size={12} className="text-gravl-volt" aria-hidden />
                        <span className="tabular-nums">{c.streak} sem.</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gravl-text-secondary">{c.nextSession}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <CardHeader icon={Layers} title="Plantillas de mesociclo" subtitle="Asigná un bloque y el motor determinístico de 1RM y fatiga de GRAVL ajusta las cargas día a día." />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {templates.map((t) => (
            <div key={t.name} className="flex flex-col rounded-xl border border-gravl-text/[0.07] bg-gravl-text/[0.02] p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-gravl-text">
                <Dumbbell size={15} className="text-gravl-violet" aria-hidden /> {t.name}
              </p>
              <p className="mt-1 text-xs text-gravl-text-secondary">{t.focus}</p>
              <p className="mt-3 text-[11px] text-gravl-text-muted">
                {t.weeks} semanas · {t.clients} {t.clients === 1 ? 'cliente' : 'clientes'}
              </p>
              <Button size="sm" className="mt-3 self-start" onClick={() => addToast(`Plantilla “${t.name}” lista para asignar.`, 'info')}>
                Asignar a cliente
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        open={!!reviewing}
        onClose={() => setReviewing(null)}
        title={reviewing ? `Form check · ${reviewing.clientName}` : 'Form check'}
        description={reviewing && `${reviewing.exercise} · ${reviewing.load}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setReviewing(null)}>Cancelar</Button>
            <Button variant="primary" icon={Send} onClick={sendReview} disabled={!feedback.trim()}>Enviar corrección</Button>
          </>
        }
      >
        <div className="flex aspect-video items-center justify-center rounded-xl border border-gravl-text/[0.08] bg-gradient-to-br from-gravl-text/[0.06] to-transparent">
          <PlayCircle size={40} className="text-gravl-text/60" aria-hidden />
        </div>
        {reviewing && <p className="mt-3 text-xs italic text-gravl-text-secondary">“{reviewing.note}”</p>}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {quickTags.map((t) => (
            <button
              key={t}
              onClick={() => setFeedback((f) => (f ? `${f} ${t}.` : `${t}.`))}
              className={cn('rounded-full border border-gravl-text/[0.1] px-2.5 py-1 text-[11px] font-semibold text-gravl-text-secondary hover:border-gravl-volt/40 hover:text-gravl-text')}
            >
              + {t}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <Field label="Tu corrección" htmlFor="fc-feedback">
            <textarea id="fc-feedback" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} className="gravl-input resize-none" placeholder="Ej.: Buena profundidad. Bracing más firme antes de bajar." />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
