'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CURRENT_HOUR, DAY_KEYS, DAY_LABELS, TODAY_KEY, peakHoursForScope, scopeStats, type DayKey } from '@/data/selectors';
import { cn } from '@/lib/cn';
import { Badge, Card, CardHeader } from '@/components/ui/primitives';
import { Clock } from 'lucide-react';

// Escala de 5 pasos, de "tranquilo" a "pico". Los textos mantienen contraste AA.
const SCALE = [
  { max: 0.25, bg: 'rgba(255,255,255,0.035)', fg: '#64748B' },
  { max: 0.45, bg: 'rgba(34,197,94,0.18)', fg: '#94A3B8' },
  { max: 0.65, bg: 'rgba(34,197,94,0.38)', fg: '#E2E8F0' },
  { max: 0.85, bg: 'rgba(198,255,0,0.5)', fg: '#F8FAFC' },
  { max: Infinity, bg: 'rgba(198,255,0,0.92)', fg: '#080A0E' },
];
const cellStyle = (ratio: number) => SCALE.find((s) => ratio <= s.max) ?? SCALE[SCALE.length - 1];

export default function PeakHeatmap() {
  const { selectedLocationId } = useApp();
  const rows = useMemo(() => peakHoursForScope(selectedLocationId), [selectedLocationId]);
  const { capacity } = scopeStats(selectedLocationId);
  const [hover, setHover] = useState<{ hour: string; day: DayKey; value: number } | null>(null);

  const peak = useMemo(() => {
    let best = { hour: rows[0].hour, day: 'mon' as DayKey, value: 0 };
    for (const r of rows) for (const d of DAY_KEYS) if (r[d] > best.value) best = { hour: r.hour, day: d, value: r[d] };
    return best;
  }, [rows]);

  const peakPct = Math.round((peak.value / capacity) * 100);

  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <CardHeader
        icon={Clock}
        title="Horarios pico y ocupación"
        subtitle="Socios en sala por franja. Usalo para staffing de coaches de piso y rotación de racks."
        action={<Badge tone={peakPct >= 85 ? 'crimson' : 'amber'}>Pico: {DAY_LABELS[peak.day]} {peak.hour} h · {peakPct}%</Badge>}
      />

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[460px] border-separate" style={{ borderSpacing: 4 }}>
          <caption className="sr-only">Socios entrenando por hora y día de la semana</caption>
          <thead>
            <tr>
              <th scope="col" className="w-10 text-left text-[10px] font-bold text-gravl-text-muted">
                <span className="sr-only">Hora</span>
              </th>
              {DAY_KEYS.map((d) => (
                <th
                  key={d}
                  scope="col"
                  className={cn('text-center text-[10px] font-bold', d === TODAY_KEY ? 'text-gravl-volt' : 'text-gravl-text-muted')}
                >
                  {DAY_LABELS[d]}
                  {d === TODAY_KEY && <span className="sr-only"> (hoy)</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.hour}>
                <th scope="row" className="tabular-nums pr-1 text-left text-[11px] font-semibold text-gravl-text-secondary">
                  {row.hour}h
                </th>
                {DAY_KEYS.map((d) => {
                  const value = row[d];
                  const s = cellStyle(value / peak.value);
                  const isNow = d === TODAY_KEY && row.hour24 === CURRENT_HOUR;
                  return (
                    <td key={d} className="p-0">
                      <div
                        onMouseEnter={() => setHover({ hour: row.hour, day: d, value })}
                        onMouseLeave={() => setHover(null)}
                        title={`${DAY_LABELS[d]} ${row.hour} h: ${value} socios (${Math.round((value / capacity) * 100)}% de capacidad)`}
                        className={cn(
                          'tabular-nums flex h-7 items-center justify-center rounded-md text-[10px] font-bold transition-transform hover:scale-105',
                          isNow && 'ring-2 ring-white ring-offset-1 ring-offset-gravl-canvas',
                        )}
                        style={{ background: s.bg, color: s.fg }}
                      >
                        {value}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-white/[0.06] pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p className="text-gravl-text-muted" aria-live="polite">
          {hover ? (
            <>
              <span className="font-semibold text-white">
                {DAY_LABELS[hover.day]} {hover.hour} h
              </span>{' '}
              · {hover.value} socios · {Math.round((hover.value / capacity) * 100)}% de capacidad
            </>
          ) : (
            <>Color relativo al pico de la semana. Recuadro blanco = ahora ({DAY_LABELS[TODAY_KEY]} {CURRENT_HOUR} h). Capacidad cómoda: {capacity} socios.</>
          )}
        </p>
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="text-[10px] text-gravl-text-muted">Tranquilo</span>
          {SCALE.map((s, i) => (
            <span key={i} className="h-3 w-3 rounded" style={{ background: s.bg }} />
          ))}
          <span className="text-[10px] font-bold text-gravl-volt">Pico</span>
        </div>
      </div>
    </Card>
  );
}
