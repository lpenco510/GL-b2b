'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { cn } from '@gravl/ui';
import { Badge, Button, Card, CardHeader, ProgressBar, Segmented } from '@gravl/ui';
import type { GymLocation, GymMachine } from '@gravl/domain';
import { ZONES, capexHint, usageColor, zoneMeta } from './zones';
import { AlertTriangle, CheckCircle2, Layers, MousePointerClick, Wrench } from 'lucide-react';

// Proyección isométrica: celda de grilla (gx, gy) → coordenadas SVG.
const TW = 64; // ancho de la celda en pantalla
const TH = 32; // alto de la celda en pantalla
const GRID_W = 12;
const GRID_D = 10;
const OX = GRID_D * (TW / 2) + 20;
const OY = 70;
const VIEW_W = (GRID_W + GRID_D) * (TW / 2) + 40;
const VIEW_H = (GRID_W + GRID_D) * (TH / 2) + OY + 30;

const iso = (gx: number, gy: number, h = 0) => [OX + (gx - gy) * (TW / 2), OY + (gx + gy) * (TH / 2) - h] as const;
const pts = (list: (readonly [number, number])[]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

function shade(hex: string, factor: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return `rgb(${r},${g},${b})`;
}

interface Placed {
  machine: GymMachine;
  gx: number;
  gy: number;
}

/** Distribuye las máquinas de cada zona en su rectángulo, con pasillos de 1 celda. */
function layout(location: GymLocation): Placed[] {
  const out: Placed[] = [];
  for (const zone of ZONES) {
    const [x0, y0, w, d] = zoneMeta[zone].rect;
    const cols = Math.max(1, Math.floor(w / 2));
    const rows = Math.max(1, Math.floor(d / 2));
    location.equipmentProfile.machines
      .filter((m) => m.zone === zone)
      .slice(0, cols * rows)
      .forEach((machine, i) => {
        out.push({ machine, gx: x0 + 1 + 2 * (i % cols), gy: y0 + 1 + 2 * Math.floor(i / cols) });
      });
  }
  // Pintor: primero lo que está "más lejos".
  return out.sort((a, b) => a.gx + a.gy - (b.gx + b.gy));
}

type ColorMode = 'usage' | 'zone';

export default function IsometricGymFloor({ location }: { location: GymLocation }) {
  const { getMachineStatus, setMachineStatus, addToast } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<ColorMode>('usage');
  const placed = useMemo(() => layout(location), [location]);
  const selected = location.equipmentProfile.machines.find((m) => m.machineId === selectedId) ?? null;

  const toggle = (m: GymMachine) => {
    const prev = getMachineStatus(m);
    const next = prev === 'OPERATIONAL' ? 'MAINTENANCE' : 'OPERATIONAL';
    setMachineStatus(m.machineId, next);
    addToast(
      next === 'MAINTENANCE'
        ? `${m.name} fuera de servicio en ${location.shortName}. La app reemplaza los ejercicios automáticamente.`
        : `${m.name} vuelve a estar operativa en ${location.shortName}.`,
      next === 'MAINTENANCE' ? 'warning' : 'success',
      { label: 'Deshacer', onClick: () => setMachineStatus(m.machineId, prev) },
    );
  };

  return (
    <Card glow="volt" className="p-5 sm:p-6">
      <CardHeader
        icon={Layers}
        title={`Planta isométrica · ${location.name}`}
        subtitle="Cada bloque es una estación real del inventario. Tocá una para ver telemetría o sacarla de servicio."
        action={
          <Segmented<ColorMode>
            label="Colorear por"
            size="sm"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'usage', label: 'Saturación' },
              { value: 'zone', label: 'Zona' },
            ]}
          />
        }
      />

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0B0E14] to-[#07090D]">
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block h-auto w-full" role="group" aria-label={`Plano de ${location.name}`}>
            {/* Piso */}
            <polygon points={pts([iso(0, 0), iso(GRID_W, 0), iso(GRID_W, GRID_D), iso(0, GRID_D)])} fill="#0E131B" stroke="rgba(255,255,255,0.1)" />
            {Array.from({ length: GRID_W + 1 }, (_, i) => (
              <line key={`x${i}`} x1={iso(i, 0)[0]} y1={iso(i, 0)[1]} x2={iso(i, GRID_D)[0]} y2={iso(i, GRID_D)[1]} stroke="rgba(255,255,255,0.035)" />
            ))}
            {Array.from({ length: GRID_D + 1 }, (_, i) => (
              <line key={`y${i}`} x1={iso(0, i)[0]} y1={iso(0, i)[1]} x2={iso(GRID_W, i)[0]} y2={iso(GRID_W, i)[1]} stroke="rgba(255,255,255,0.035)" />
            ))}

            {/* Zonas */}
            {ZONES.map((z) => {
              const [x, y, w, d] = zoneMeta[z].rect;
              const c = zoneMeta[z].color;
              const [lx, ly] = iso(x + 0.25, y + d - 0.35);
              return (
                <g key={z}>
                  <polygon
                    points={pts([iso(x + 0.1, y + 0.1), iso(x + w - 0.1, y + 0.1), iso(x + w - 0.1, y + d - 0.1), iso(x + 0.1, y + d - 0.1)])}
                    fill={`${c}0D`}
                    stroke={`${c}55`}
                    strokeDasharray="5 5"
                  />
                  <text x={lx} y={ly} fill={`${c}AA`} fontSize="10" fontWeight={800} letterSpacing="1.5" transform={`rotate(26.565 ${lx} ${ly})`}>
                    {zoneMeta[z].label.toUpperCase()}
                  </text>
                </g>
              );
            })}

            {/* Estaciones */}
            {placed.map(({ machine, gx, gy }) => {
              const status = getMachineStatus(machine);
              const down = status === 'MAINTENANCE';
              const base = down ? '#EF4444' : mode === 'usage' ? usageColor(machine.weeklyUsageRate) : zoneMeta[machine.zone].color;
              const h = down ? 8 : 10 + (machine.weeklyUsageRate / 100) * 26;
              const s = 0.42; // medio lado del bloque en celdas
              const top = [iso(gx - s, gy - s, h), iso(gx + s, gy - s, h), iso(gx + s, gy + s, h), iso(gx - s, gy + s, h)];
              const right = [iso(gx + s, gy - s, h), iso(gx + s, gy + s, h), iso(gx + s, gy + s), iso(gx + s, gy - s)];
              const left = [iso(gx - s, gy + s, h), iso(gx + s, gy + s, h), iso(gx + s, gy + s), iso(gx - s, gy + s)];
              const isSel = selectedId === machine.machineId;
              const [tx, ty] = iso(gx, gy, h + 12);
              return (
                <g
                  key={machine.machineId}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSel}
                  aria-label={`${machine.name}: ${down ? 'en mantenimiento' : `${machine.weeklyUsageRate}% de uso semanal`}`}
                  onClick={() => setSelectedId(isSel ? null : machine.machineId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(isSel ? null : machine.machineId);
                    }
                  }}
                  className="cursor-pointer outline-none [&:focus-visible>polygon]:stroke-white"
                  style={{ opacity: selectedId && !isSel ? 0.45 : 1, transition: 'opacity .2s' }}
                >
                  <title>{`${machine.name} · ${down ? 'Mantenimiento' : `${machine.weeklyUsageRate}%`}`}</title>
                  <polygon points={pts(left)} fill={shade(base, 0.45)} />
                  <polygon points={pts(right)} fill={shade(base, 0.65)} />
                  <polygon points={pts(top)} fill={base} stroke={isSel ? '#fff' : 'rgba(0,0,0,0.35)'} strokeWidth={isSel ? 2 : 1} />
                  {(isSel || down || machine.weeklyUsageRate >= 88) && (
                    <g pointerEvents="none">
                      <rect x={tx - 22} y={ty - 11} width={44} height={16} rx={5} fill="rgba(8,10,14,0.9)" stroke={`${base}88`} />
                      <text x={tx} y={ty + 1} textAnchor="middle" fontSize="10" fontWeight={800} fill={base}>
                        {down ? 'FUERA' : `${machine.weeklyUsageRate}%`}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1 rounded-lg bg-black/50 px-2.5 py-1.5 text-[10px] font-semibold text-gravl-text-secondary backdrop-blur">
            {mode === 'usage' ? (
              <>
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-gravl-emerald" /> &lt;65%</span>
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-gravl-amber" /> 65–85%</span>
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-gravl-crimson" /> &gt;85% / fuera</span>
              </>
            ) : (
              ZONES.map((z) => (
                <span key={z} className="flex items-center gap-1">
                  <i className="h-2 w-2 rounded-sm" style={{ background: zoneMeta[z].color }} /> {zoneMeta[z].label}
                </span>
              ))
            )}
            <span className="text-gravl-text-muted">· altura = uso</span>
          </div>
        </div>

        {/* Panel de detalle */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4" aria-live="polite">
          {selected ? (
            (() => {
              const status = getMachineStatus(selected);
              const hint = capexHint(selected.weeklyUsageRate);
              return (
                <div className="flex h-full flex-col">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: zoneMeta[selected.zone].color }}>
                    {zoneMeta[selected.zone].label}
                  </p>
                  <h4 className="mt-1 text-base font-bold text-white">{selected.name}</h4>
                  <p className="text-xs text-gravl-text-muted">
                    {selected.quantity} {selected.quantity === 1 ? 'unidad' : 'unidades'}
                  </p>

                  <div className="mt-5 space-y-4 text-xs">
                    <div>
                      <div className="mb-1.5 flex justify-between">
                        <span className="text-gravl-text-secondary">Saturación semanal</span>
                        <span className="tabular-nums font-bold" style={{ color: usageColor(selected.weeklyUsageRate) }}>
                          {selected.weeklyUsageRate}%
                        </span>
                      </div>
                      <ProgressBar value={selected.weeklyUsageRate} color={usageColor(selected.weeklyUsageRate)} label="Saturación" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gravl-text-secondary">Estado en la app</span>
                      {status === 'OPERATIONAL' ? (
                        <Badge tone="emerald" icon={CheckCircle2}>Operativa</Badge>
                      ) : (
                        <Badge tone="crimson" icon={AlertTriangle}>Auto-swap activo</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gravl-text-secondary">Sugerencia CapEx</span>
                      <Badge tone={hint.tone}>{hint.label}</Badge>
                    </div>
                    {status === 'MAINTENANCE' && (
                      <p className="rounded-lg border border-gravl-amber/20 bg-gravl-amber/[0.06] p-2.5 text-[11px] leading-relaxed text-gravl-text-secondary">
                        Los socios de {location.shortName} reciben ejercicios equivalentes con el equipamiento disponible. No ven la máquina en su rutina.
                      </p>
                    )}
                  </div>

                  <Button
                    className="mt-auto w-full justify-center"
                    variant={status === 'OPERATIONAL' ? 'danger' : 'success'}
                    icon={Wrench}
                    onClick={() => toggle(selected)}
                  >
                    {status === 'OPERATIONAL' ? 'Marcar en mantenimiento' : 'Restaurar a operativa'}
                  </Button>
                </div>
              );
            })()
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-8 text-center">
              <MousePointerClick size={22} className="text-gravl-text-muted" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-white">Seleccioná una estación</p>
              <p className="mt-1 max-w-[220px] text-xs text-gravl-text-muted">
                Los bloques más altos y rojos son los cuellos de botella de la sala.
              </p>
              <div className="mt-5 w-full space-y-1.5 text-left">
                {[...location.equipmentProfile.machines]
                  .filter((m) => getMachineStatus(m) === 'OPERATIONAL')
                  .sort((a, b) => b.weeklyUsageRate - a.weeklyUsageRate)
                  .slice(0, 3)
                  .map((m) => (
                    <button
                      key={m.machineId}
                      onClick={() => setSelectedId(m.machineId)}
                      className={cn('flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors hover:bg-white/[0.05]')}
                    >
                      <span className="truncate text-gravl-text-secondary">{m.name}</span>
                      <span className="tabular-nums font-bold" style={{ color: usageColor(m.weeklyUsageRate) }}>
                        {m.weeklyUsageRate}%
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
