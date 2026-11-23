'use client';

import React from 'react';
import { nudgeTemplates, organization } from '@/data/mockGravlB2B';
import { cn } from '@/lib/cn';
import type { B2BMemberTelemetry } from '@/types/gravl-b2b';
import { Bell, Wand2 } from 'lucide-react';

export function renderTemplate(body: string, m: B2BMemberTelemetry | undefined) {
  const firstName = m?.fullName.split(' ')[0] ?? 'Sofía';
  // "Desde que arrancaste": proxy simple sobre el Strength Score base (110).
  const delta = m ? Math.max(4, Math.round((m.strengthScore - 110) / 5)) : 12;
  return body.replace('{name}', firstName).replace('{gym}', organization.name).replace('{delta}', String(delta));
}

/** Selector de plantilla + preview del push tal como lo ve el socio. */
export default function NudgeComposer({
  templateId,
  onTemplate,
  member,
}: {
  templateId: string;
  onTemplate: (id: string) => void;
  member?: B2BMemberTelemetry;
}) {
  const tpl = nudgeTemplates.find((t) => t.id === templateId) ?? nudgeTemplates[0];

  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Plantilla de mensaje" className="grid grid-cols-3 gap-2">
        {nudgeTemplates.map((t) => {
          const active = t.id === tpl.id;
          return (
            <button
              key={t.id}
              role="radio"
              aria-checked={active}
              onClick={() => onTemplate(t.id)}
              className={cn(
                'rounded-xl border p-2.5 text-left transition-colors',
                active ? 'border-gravl-volt/50 bg-gravl-volt/[0.08]' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16]',
              )}
            >
              <p className={cn('text-xs font-bold', active ? 'text-gravl-volt' : 'text-white')}>{t.label}</p>
              <p className="mt-0.5 text-[10px] capitalize text-gravl-text-muted">{t.tone}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-3">
        <div className="flex items-start gap-2.5 rounded-xl bg-white/[0.06] p-3 backdrop-blur">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gravl-volt text-[9px] font-black text-gravl-canvas">
            {organization.shortName}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-white">
              {organization.name} <span className="font-normal text-gravl-text-muted">· ahora</span>
            </p>
            <p className="mt-0.5 text-xs leading-snug text-gravl-text">{renderTemplate(tpl.body, member)}</p>
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] text-gravl-text-secondary">
          <span className="flex items-center gap-1.5">
            <Wand2 size={12} className="text-gravl-cyan" aria-hidden /> Ajuste automático: {tpl.sessionAdjustment}
          </span>
          <span className="flex items-center gap-1.5">
            <Bell size={12} className="text-gravl-text-muted" aria-hidden /> Se envía en su horario habitual de entrenamiento
          </span>
        </div>
      </div>
    </div>
  );
}
