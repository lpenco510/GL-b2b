'use client';

import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, Download, Flame, MapPin, PhoneCall, Users } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useDeal, useTenant } from '@/components/layout/useTenant';
import { locationById, locations, membersInScope, networkSize, organization, retentionCohorts, scopeStats } from '@gravl/mock-data';
import { fmtInt, fmtPct } from '@gravl/domain';
import { Badge, Button, Card, CardHeader, KpiTile, PageHeader, ProgressBar, cn } from '@gravl/ui';
import RecommendedActions from '@/components/dashboard/RecommendedActions';
import PeakHeatmap from '@/components/dashboard/PeakHeatmap';
import LiveFeed from '@/components/dashboard/LiveFeed';

type TooltipPayload = { name?: string; value?: number; color?: string };

function RetentionTooltip({ active, payload, label }: { active?: boolean; payload?: readonly TooltipPayload[]; label?: string | number }) {
  if (!active || !payload?.length) return null;
  const a = payload.find((p) => p.name === 'Con GRAVL')?.value ?? 0;
  const b = payload.find((p) => p.name === 'Sin GRAVL')?.value ?? 0;
  return (
    <div className="gravl-glass px-3 py-2.5 text-xs">
      <p className="gravl-label mb-1.5">Mes {label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6 py-0.5">
          <span className="text-gravl-text-secondary">{p.name}</span>
          <span className="gravl-num text-base text-gravl-text">{p.value}%</span>
        </div>
      ))}
      <p className="mt-1.5 border-t border-gravl-line pt-1.5 font-semibold text-gravl-text">+{a - b} pts</p>
    </div>
  );
}

function exportSummary(rows: [string, string | number][]) {
  const csv = ['Métrica,Valor', ...rows.map(([k, v]) => `"${k}","${v}"`)].join('\n');
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gravl-resumen.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/** Ranking de sedes: en una cadena de cientos de sedes, la pregunta es "¿dónde actúo primero?". */
function SedesRanking() {
  const { selectedLocationId, setSelectedLocationId } = useApp();
  const deal = useDeal();
  const rows = locations
    .map((l) => {
      const list = membersInScope(l.id);
      const weekly = list.length ? (list.filter((m) => m.workoutsThisWeek > 0).length / list.length) * 100 : 0;
      const intent = list.filter((m) => m.cancelIntent).length;
      const top = [...l.equipmentProfile.machines].sort((a, b) => (b.busySwaps30d ?? 0) - (a.busySwaps30d ?? 0))[0];
      return { l, linked: list.length, weekly, intent, top };
    })
    .sort((a, b) => a.weekly - b.weekly);
  void deal;

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <CardHeader
        icon={MapPin}
        title="Sedes del piloto"
        subtitle="Ordenadas de menor a mayor actividad semanal. Tocá una para filtrar todo el panel."
      />
      <div className="mt-4 -mx-2 overflow-x-auto">
        <table className="w-full min-w-[460px] text-[13px]">
          <caption className="sr-only">Actividad por sede</caption>
          <thead>
            <tr className="text-left">
              <th scope="col" className="gravl-label px-2 pb-2">Sede</th>
              <th scope="col" className="gravl-label px-2 pb-2 text-right">Con GRAVL</th>
              <th scope="col" className="gravl-label px-2 pb-2">Activos sem.</th>
              <th scope="col" className="gravl-label px-2 pb-2 text-right">Baja</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ l, linked, weekly, intent }) => (
              <tr
                key={l.id}
                onClick={() => setSelectedLocationId(selectedLocationId === l.id ? 'all' : l.id)}
                className={cn('gravl-row cursor-pointer border-t border-gravl-line', selectedLocationId === l.id && 'bg-gravl-text/[0.04]')}
              >
                <td className="px-2 py-2.5">
                  <span className="font-semibold text-gravl-text">{l.shortName}</span>
                  <span className="ml-2 text-[11px] text-gravl-text-muted">{l.tier}</span>
                </td>
                <td className="tabular-nums px-2 py-2.5 text-right text-gravl-text-secondary">{fmtInt(linked)}</td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={weekly} className="w-20" label={`Activos ${Math.round(weekly)}%`} color={weekly < 55 ? 'var(--color-gravl-crimson)' : 'var(--color-gravl-text)'} />
                    <span className="tabular-nums w-9 text-gravl-text">{Math.round(weekly)}%</span>
                  </div>
                </td>
                <td className={cn('tabular-nums px-2 py-2.5 text-right', intent ? 'font-semibold text-gravl-crimson' : 'text-gravl-text-muted')}>{intent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { selectedLocationId, addToast } = useApp();
  const deal = useDeal();
  const tenant = useTenant();
  const stats = scopeStats(selectedLocationId, deal);
  const scopeName = selectedLocationId === 'all' ? `Piloto · ${stats.locationsCount} de ${networkSize.label}` : locationById(selectedLocationId)?.name;
  const m3 = retentionCohorts[3];
  const chartData = retentionCohorts.slice(0, 7).map((c) => ({ month: c.month, con: c.withGravl, sin: Math.round((c.withGravl + c.withoutGravl * 2) / 3) }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${tenant.name} · ${scopeName}`}
        title={
          <>
            Command Center<span className="text-gravl-text-muted">.</span>
          </>
        }
        description="Lo que pasa hoy en tus sedes y qué hacer al respecto. Cada número dice de dónde sale."
        actions={
          <Button
            icon={Download}
            onClick={() => {
              exportSummary([
                ['Alcance', scopeName ?? ''],
                ['Socios con GRAVL', stats.total],
                ['Activos esta semana (%)', stats.weeklyActiveRate],
                ['Intención de baja', stats.cancelIntent],
                ['Cuotas en riesgo (12 meses)', stats.feesAtRisk],
              ]);
              addToast('Resumen exportado como CSV.', 'success');
            }}
          >
            Exportar
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label="Entrenaron esta semana"
          value={stats.weeklyActiveRate}
          unit="%"
          delta={`${fmtInt(Math.round((stats.total * stats.weeklyActiveRate) / 100))} socios`}
          deltaDirection="none"
          source="entrenamientos registrados en GRAVL"
          spark={[52, 55, 54, 58, 61, 60, 63, stats.weeklyActiveRate]}
          emphasis
        />
        <KpiTile
          label="Socios con GRAVL"
          value={fmtInt(stats.total)}
          delta={`${fmtPct((stats.total / organization.totalGymMembers) * 100)} de los socios del piloto`}
          deltaDirection="none"
          icon={Users}
          source="vínculos carnet SportClub ↔ cuenta GRAVL"
          spark={[1200, 1650, 2100, 2480, 2900, 3250, stats.total]}
        />
        <KpiTile
          label="Cuotas en riesgo · 12 meses"
          value={fmtInt(stats.feesAtRisk)}
          delta={`${fmtInt(stats.cancelIntent)} socios con intención de baja`}
          deltaDirection="down"
          deltaGood={false}
          icon={PhoneCall}
          hint="Según el modelo de cada plan: en abono fijo solo cuenta la intención de baja."
          source="ERP + actividad en GRAVL"
        />
        <KpiTile
          label="Retención mes 3"
          value={m3.withGravl}
          unit="%"
          delta={`vs. ${Math.round((m3.withGravl + m3.withoutGravl * 2) / 3)}% sin GRAVL en las mismas sedes`}
          icon={Flame}
          source="cohortes ERP × GRAVL (grupo de control)"
        />
      </div>

      <RecommendedActions />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="flex flex-col p-5 sm:p-6 xl:col-span-7">
          <CardHeader
            icon={Activity}
            title="Retención: socios con GRAVL vs. sin GRAVL"
            subtitle="Misma red, mismas sedes, mismos planes. Es la única comparación que vale para el piloto: la medimos contra tu propio grupo de control."
            action={<Badge tone="volt">Objetivo del piloto</Badge>}
          />
          <div className="mt-4 h-[260px] w-full" role="img" aria-label="Curva de retención de 6 meses, socios con GRAVL contra socios sin GRAVL">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="curveCon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d2fe0b" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#d2fe0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--g-line)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--g-fg-3)' }} tickFormatter={(v) => (v === 0 ? 'Alta' : `Mes ${v}`)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--g-fg-3)' }} tickFormatter={(v) => `${v}%`} domain={[60, 100]} axisLine={false} tickLine={false} />
                <Tooltip content={<RetentionTooltip />} cursor={{ stroke: 'var(--g-line)' }} />
                <Area type="monotone" dataKey="sin" name="Sin GRAVL" stroke="var(--g-fg-3)" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                <Area type="monotone" dataKey="con" name="Con GRAVL" stroke="var(--g-fg)" strokeWidth={2.5} fill="url(#curveCon)" activeDot={{ r: 5, fill: '#d2fe0b', stroke: 'var(--g-fg)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs text-gravl-text-muted">
            Curva ilustrativa. En el piloto se reemplaza por la medición real a partir del día 1.
          </p>
        </Card>
        <div className="xl:col-span-5">
          <SedesRanking />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <PeakHeatmap />
        </div>
        <div className="xl:col-span-5">
          <LiveFeed />
        </div>
      </div>
    </div>
  );
}
