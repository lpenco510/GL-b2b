import React from 'react';
import type { MemberStatus } from '@gravl/domain';
import { Badge, type Tone } from '@gravl/ui';

export const statusMeta: Record<MemberStatus, { label: string; tone: Tone; color: string }> = {
  ON_FIRE: { label: 'On Fire', tone: 'volt', color: 'var(--color-gravl-volt)' },
  ACTIVE: { label: 'Activo', tone: 'emerald', color: 'var(--color-gravl-emerald)' },
  NEEDS_NUDGE: { label: 'Necesita nudge', tone: 'amber', color: 'var(--color-gravl-amber)' },
  AT_RISK: { label: 'En riesgo', tone: 'crimson', color: 'var(--color-gravl-crimson)' },
};

export function StatusBadge({ status }: { status: MemberStatus }) {
  const s = statusMeta[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export const riskColor = (risk: number) => (risk >= 60 ? 'var(--color-gravl-crimson)' : risk >= 35 ? 'var(--color-gravl-amber)' : 'var(--color-gravl-emerald)');

export function StreakDots({ weeks }: { weeks: number }) {
  const filled = Math.min(weeks, 8);
  return (
    <span className="flex items-center gap-2" aria-label={`Racha de ${weeks} semanas`}>
      <span className="flex gap-0.5" aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < filled ? 'bg-gravl-lime' : 'bg-gravl-text/[0.08]'}`} />
        ))}
      </span>
      <span className="tabular-nums text-[11px] text-gravl-text-secondary">{weeks}</span>
    </span>
  );
}
