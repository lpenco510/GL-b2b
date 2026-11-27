'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CURRENT_HOUR, DAY_KEYS, DAY_LABELS, TODAY_KEY, peakHoursForScope, type DayKey } from '@gravl/mock-data';
import { cn } from '@gravl/ui';
import { Badge, Card, CardHeader } from '@gravl/ui';
import { Clock } from 'lucide-react';

// Escala de 5 pasos, de "tranquilo" a "pico". Los textos mantienen contraste AA.
const SCALE = [
  { max: 0.25, bg: 'color-mix(in srgb, var(--g-fg) 4%, transparent)', fg: 'var(--g-fg-3)' },
  { max: 0.45, bg: 'color-mix(in srgb, var(--g-fg) 9%, transparent)', fg: 'var(--g-fg-2)' },
  { max: 0.65, bg: 'color-mix(in srgb, #d2fe0b 38%, transparent)', fg: 'var(--g-fg)' },
  { max: 0.85, bg: 'color-mix(in srgb, #d2fe0b 72%, transparent)', fg: '#080e18' },
  { max: Infinity, bg: '#d2fe0b', fg: '#080e18' },
]
const cellStyle = (ratio: number) => SCALE.find((s) => ratio <= s.max) ?? SCALE[SCALE.length - 1];

export default function PeakHeatmap() {
  const { selectedLocationId } = useApp();
  const rows = useMemo(() => peakHoursForScope(selectedLocationId), [selectedLocationId]);
  const [hover, setHover] = useState<{ hour: string; day: DayKey; value: number } | null>(null);

  const peak = useMemo(() => {
    let best = { hour: rows[0].hour, day: 'mon' as DayKey, value: 0 };
    for (const r of rows) for (const d of DAY_KEYS) if (r[d] > best.value) best = { hour: r.hour, day: d, value: r[d] };
    return best;
  }, [rows]);


  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <CardHeader
        icon={Clock}
        title="Cuándo entrenan tus socios"
        subtitle="Inicios de entrenamiento registrados en GRAVL por franja. Sirve para staffing de profes de sala y para sugerir horarios valle."
        action={<Badge tone="ink">Pico: {DAY_LABELS[peak.day]} {peak.hour} h</Badge>}
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
                        title={`${DAY_LABELS[d]} ${row.hour} h: ${value} entrenamientos iniciados`}
                        className={cn(
                          'tabular-nums flex h-7 cursor-default items-center justify-center rounded-md text-[10px] font-bold transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:z-10 hover:scale-[1.12] hover:shadow-[0_4px_12px_-4px_rgba(8,14,24,0.35)]',
                          isNow && 'ring-2 ring-gravl-text ring-offset-1 ring-offset-gravl-card',
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

      <div className="mt-auto flex flex-col gap-3 border-t border-gravl-text/[0.06] pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p className="text-gravl-text-muted" aria-live="polite">
          {hover ? (
            <>
              <span className="font-semibold text-gravl-text">
                {DAY_LABELS[hover.day]} {hover.hour} h
              </span>{' '}
              · {hover.value} entrenamientos iniciados
            </>
          ) : (
            <>Color relativo al pico de la semana. Recuadro blanco = ahora ({DAY_LABELS[TODAY_KEY]} {CURRENT_HOUR} h). Muestra: socios con GRAVL.</>
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
