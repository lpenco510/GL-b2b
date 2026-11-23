import React from 'react';
import type { MemberStatus } from '@/types/gravl-b2b';
import { Badge, type Tone } from '@/components/ui/primitives';

export const statusMeta: Record<MemberStatus, { label: string; tone: Tone; color: string }> = {
  ON_FIRE: { label: 'On Fire', tone: 'volt', color: '#C6FF00' },
  ACTIVE: { label: 'Activo', tone: 'emerald', color: '#22C55E' },
  NEEDS_NUDGE: { label: 'Necesita nudge', tone: 'amber', color: '#F59E0B' },
  AT_RISK: { label: 'En riesgo', tone: 'crimson', color: '#EF4444' },
};

export function StatusBadge({ status }: { status: MemberStatus }) {
  const s = statusMeta[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export const riskColor = (risk: number) => (risk >= 60 ? '#EF4444' : risk >= 35 ? '#F59E0B' : '#22C55E');

export function StreakDots({ weeks }: { weeks: number }) {
  const filled = Math.min(weeks, 8);
  return (
    <span className="flex items-center gap-2" aria-label={`Racha de ${weeks} semanas`}>
      <span className="flex gap-0.5" aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < filled ? 'bg-gravl-volt' : 'bg-white/[0.08]'}`} />
        ))}
      </span>
      <span className="tabular-nums text-[11px] text-gravl-text-secondary">{weeks}</span>
    </span>
  );
}
