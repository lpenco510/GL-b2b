'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { locationName, nudgeTemplates } from '@/data/mockGravlB2B';
import { churnFactors, memberWeeklyHistory } from '@/data/selectors';
import { daysSince, fmtDate, fmtRelative } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Avatar, Badge, Button, ProgressBar } from '@/components/ui/primitives';
import { Drawer } from '@/components/ui/Overlay';
import type { B2BMemberTelemetry } from '@/types/gravl-b2b';
import NudgeComposer from './NudgeComposer';
import { StatusBadge, riskColor } from './memberUi';
import { Check, Flame, Send } from 'lucide-react';

export default function MemberDrawer({ member, onClose }: { member: B2BMemberTelemetry | null; onClose: () => void }) {
  const { nudgedAt, markNudged, addToast } = useApp();
  const [templateId, setTemplateId] = useState(nudgeTemplates[0].id);

  const m = member;
  const days = m ? daysSince(m.lastWorkoutAt) : 0;
  const history = m ? memberWeeklyHistory(m) : [];
  const maxH = Math.max(m?.weeklyTarget ?? 4, ...history);
  const nudged = m ? nudgedAt[m.userId] : undefined;

  return (
    <Drawer
      open={!!m}
      onClose={onClose}
      title={
        m && (
          <span className="flex items-center gap-3">
            <Avatar name={m.fullName} size={40} />
            <span className="min-w-0">
              <span className="block truncate">{m.fullName}</span>
              <span className="mt-0.5 flex items-center gap-2 text-xs font-medium text-gravl-text-secondary">
                {locationName(m.locationId)} · socio desde {fmtDate(m.joinedAt)}
              </span>
            </span>
          </span>
        )
      }
      footer={
        m &&
        (nudged ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-gravl-emerald">
            <Check size={16} aria-hidden /> Nudge enviado {fmtRelative(nudged)}. Medimos su vuelta en 72 h.
          </p>
        ) : (
          <Button
            variant="primary"
            icon={Send}
            className="w-full justify-center"
            onClick={() => {
              markNudged([m.userId]);
              addToast(`Nudge enviado a ${m.fullName} desde la app de GRAVL.`, 'success');
            }}
          >
            Enviar nudge a {m.fullName.split(' ')[0]}
          </Button>
        ))
      }
    >
      {m && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={m.status} />
            {m.macrosActive && <Badge tone="cyan">Gravl Macros</Badge>}
            {m.currentStreakWeeks > 0 && (
              <Badge tone="volt" icon={Flame}>
                Racha de {m.currentStreakWeeks} sem.
              </Badge>
            )}
          </div>

          <section aria-label="Riesgo de baja">
            <div className="mb-2 flex items-end justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-gravl-text-muted">Riesgo de baja (30 días)</p>
              <p className="tabular-nums text-2xl font-black" style={{ color: riskColor(m.churnRisk) }}>
                {m.churnRisk}%
              </p>
            </div>
            <ProgressBar value={m.churnRisk} color={riskColor(m.churnRisk)} label="Riesgo de baja" />
            <ul className="mt-3 space-y-1.5">
              {churnFactors(m, days).map((f) => (
                <li key={f.label} className="flex items-center justify-between text-xs">
                  <span className="text-gravl-text-secondary">{f.label}</span>
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase',
                      f.weight === 'alto' ? 'text-rose-400' : f.weight === 'medio' ? 'text-gravl-amber' : 'text-gravl-emerald',
                    )}
                  >
                    {f.weight === 'bajo' ? 'protector' : `impacto ${f.weight}`}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="Métricas" className="grid grid-cols-3 gap-2">
            {[
              { l: 'Última sesión', v: days === 0 ? 'Hoy' : `${days} d` },
              { l: 'Sesiones 30 d', v: m.workoutsLast30Days },
              { l: 'Esta semana', v: `${m.workoutsThisWeek}/${m.weeklyTarget}` },
              { l: 'Strength Score', v: m.strengthScore },
              { l: 'Δ 30 días', v: `${m.strengthScoreDelta30d >= 0 ? '+' : ''}${m.strengthScoreDelta30d}` },
              { l: 'Readiness', v: `${m.readinessScore ?? '—'}%` },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[10px] font-semibold text-gravl-text-muted">{s.l}</p>
                <p className="tabular-nums mt-1 text-base font-bold text-white">{s.v}</p>
              </div>
            ))}
          </section>

          <section aria-label="Sesiones por semana">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gravl-text-muted">Sesiones por semana · últimas 8</p>
            <div className="flex h-24 items-end gap-2">
              {history.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="tabular-nums text-[10px] text-gravl-text-muted">{v}</span>
                  <div
                    className="w-full rounded-md"
                    style={{
                      height: `${Math.max(4, (v / maxH) * 64)}px`,
                      background: v >= m.weeklyTarget ? '#C6FF00' : v === 0 ? 'rgba(239,68,68,0.5)' : 'rgba(56,189,248,0.55)',
                    }}
                  />
                  <span className="text-[9px] text-gravl-text-muted">{i === 7 ? 'Hoy' : `S-${7 - i}`}</span>
                </div>
              ))}
            </div>
          </section>

          {!nudged && (
            <section aria-label="Componer nudge">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gravl-text-muted">Nudge personalizado</p>
              <NudgeComposer templateId={templateId} onTemplate={setTemplateId} member={m} />
            </section>
          )}
        </div>
      )}
    </Drawer>
  );
}
