'use client';

import React from 'react';
import Link from 'next/link';
import {
  Area, AreaChart, CartesianGrid, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Activity, AlertTriangle, ArrowRight, CircleDollarSign, Download, Flame, ShieldCheck, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { locationById, muscleScores, networkBenchmarks, retentionCohorts } from '@/data/mockGravlB2B';
import { scopeStats } from '@/data/selectors';
import { fmtCompact, fmtDec, fmtInt, fmtPct, fmtUsd, fmtUsdCompact } from '@/lib/format';
import { Badge, Button, Card, CardHeader, KpiTile, PageHeader } from '@/components/ui/primitives';
import RecommendedActions from '@/components/dashboard/RecommendedActions';
import PeakHeatmap from '@/components/dashboard/PeakHeatmap';
import LiveFeed from '@/components/dashboard/LiveFeed';

type TooltipPayload = { name?: string; value?: number; color?: string };

function RetentionTooltip({ active, payload, label }: { active?: boolean; payload?: readonly TooltipPayload[]; label?: string | number }) {
  if (!active || !payload?.length) return null;
  const gravl = payload.find((p) => p.name === 'Con GRAVL')?.value ?? 0;
  const industry = payload.find((p) => p.name === 'Promedio industria')?.value ?? 0;
  return (
    <div className="gravl-glass p-3 text-xs">
      <p className="mb-1.5 font-bold text-white">Mes {label} de membresía</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6 py-0.5">
          <span className="flex items-center gap-1.5 text-gravl-text-secondary">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="tabular-nums font-bold text-white">{p.value}%</span>
        </div>
      ))}
      <p className="mt-2 border-t border-white/[0.08] pt-2 text-[11px] font-semibold text-gravl-volt">
        +{gravl - industry} pts de retención con GRAVL
      </p>
    </div>
  );
}

const milestones = [1, 3, 6, 12];

function exportSummary(rows: [string, string | number][]) {
  const csv = ['Métrica,Valor', ...rows.map(([k, v]) => `"${k}","${v}"`)].join('\n');
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gravl-command-center.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  const { selectedLocationId, addToast } = useApp();
  const stats = scopeStats(selectedLocationId);
  const scopeName = selectedLocationId === 'all' ? `Toda la red · ${stats.locationsCount} sedes` : locationById(selectedLocationId)?.name;
  const weakest = [...muscleScores].sort((a, b) => a.score - b.score)[0];
  const m6 = retentionCohorts[6];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Command Center"
        badge={<Badge tone="volt">{scopeName}</Badge>}
        description="Retención, uso del equipamiento y actividad en tiempo real. Lo que necesitás decidir hoy, arriba de todo."
        actions={
          <>
            <span className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-semibold text-gravl-text-secondary xl:flex">
              <ShieldCheck size={14} className="text-gravl-cyan" aria-hidden />
              0% comisión de App Store · cobro directo vía Stripe
            </span>
            <Button
              icon={Download}
              onClick={() => {
                exportSummary([
                  ['Alcance', scopeName ?? ''],
                  ['Socios', stats.total],
                  ['Entrenando ahora', stats.liveNow],
                  ['Activos esta semana (%)', stats.weeklyActiveRate],
                  ['En riesgo', stats.atRisk],
                  ['Necesitan nudge', stats.needsNudge],
                  ['Ingreso anual en riesgo (USD)', stats.revenueAtRiskUsd],
                  ['Supervivencia 90 días (%)', networkBenchmarks.survivalRate90Day],
                ]);
                addToast('Reporte exportado como CSV.', 'success');
              }}
            >
              Exportar
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label="Entrenando ahora"
          value={fmtInt(stats.liveNow)}
          delta={`${stats.occupancyPct}% de capacidad`}
          deltaDirection="none"
          hint={`${fmtPct(stats.weeklyActiveRate)} de los socios entrenó esta semana`}
          icon={Activity}
          color="#22C55E"
          spark={[14, 18, 22, 19, 24, 28, 35, 42, 48, 54, 52, stats.liveNow]}
          glow="volt"
        />
        <KpiTile
          label="Ingreso anual en riesgo"
          value={fmtUsdCompact(stats.revenueAtRiskUsd)}
          delta={`${fmtInt(stats.atRisk + stats.needsNudge)} socios inactivos`}
          deltaDirection="down"
          deltaGood={false}
          hint="Probabilidad de baja × cuota anual"
          icon={CircleDollarSign}
          color="#EF4444"
          spark={[31, 30, 33, 29, 27, 28, 26, 25]}
          glow="crimson"
        />
        <KpiTile
          label="Supervivencia a 90 días"
          value={fmtPct(networkBenchmarks.survivalRate90Day, 1)}
          delta={`+${fmtDec(networkBenchmarks.survivalRate90Day - networkBenchmarks.survivalRateIndustry)} pts vs. industria`}
          hint="Socios que superan el hito de 5 entrenamientos"
          icon={Users}
          color="#38BDF8"
          spark={[52, 58, 64, 72, 80, 85, 88.2]}
          glow="cyan"
        />
        <KpiTile
          label="Asistencia semanal"
          value={`+${fmtPct(networkBenchmarks.attendanceLift, 1)}`}
          delta={`${fmtDec(networkBenchmarks.avgWorkoutsPerWeek)} sesiones/sem. por socio`}
          hint="vs. baseline previo a GRAVL"
          icon={TrendingUp}
          color="#C6FF00"
          spark={[2.2, 2.4, 2.5, 2.7, 2.9, 3.1, 3.2, 3.4]}
          glow="volt"
        />
      </div>

      <RecommendedActions />

      {/* Retención + Radar */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="flex flex-col p-5 sm:p-6 xl:col-span-7">
          <CardHeader
            icon={Flame}
            title="Curva de retención: con GRAVL vs. promedio de la industria"
            subtitle={`Los socios que completan ≥5 sesiones en su primer mes retienen al ${m6.withGravl}% en el mes 6, contra ${m6.withoutGravl}% de la industria.`}
            action={<Badge tone="volt">{m6.withGravl}% en mes 6</Badge>}
          />
          <div className="mt-4 h-[280px] w-full" role="img" aria-label={`Curva de retención a 12 meses. Mes 12: ${retentionCohorts[12].withGravl}% con GRAVL contra ${retentionCohorts[12].withoutGravl}% de la industria.`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={retentionCohorts} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="curveGravl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6FF00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C6FF00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(v) => (v === 0 ? 'Alta' : `M${v}`)}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${v}%`} domain={[30, 100]} axisLine={false} tickLine={false} />
                <Tooltip content={<RetentionTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
                <Area type="monotone" dataKey="withoutGravl" name="Promedio industria" stroke="#64748B" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                <Area type="monotone" dataKey="withGravl" name="Con GRAVL" stroke="#C6FF00" strokeWidth={3} fill="url(#curveGravl)" activeDot={{ r: 5, fill: '#C6FF00', stroke: '#080A0E', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-4 sm:grid-cols-4">
            {milestones.map((m) => {
              const c = retentionCohorts[m];
              const hl = m === 6;
              return (
                <div key={m} className={hl ? 'rounded-xl border border-gravl-volt/20 bg-gravl-volt/[0.06] p-3' : 'rounded-xl bg-white/[0.03] p-3'}>
                  <p className={`text-[10px] font-bold uppercase ${hl ? 'text-gravl-volt' : 'text-gravl-text-muted'}`}>
                    Mes {m}
                    {m === 3 ? ' · crítico' : m === 6 ? ' · hito B2B' : m === 12 ? ' · anual' : ''}
                  </p>
                  <p className="tabular-nums mt-1 text-sm font-bold text-white">
                    {c.withGravl}% <span className="font-medium text-gravl-text-muted">vs {c.withoutGravl}%</span>
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="flex flex-col p-5 sm:p-6 xl:col-span-5">
          <CardHeader
            icon={Sparkles}
            iconColor="var(--color-gravl-cyan)"
            title="Balance muscular de la cohorte"
            subtitle="Activación acumulada de todos los socios. Detecta qué zonas de la sala están sub-utilizadas."
            action={<Badge tone="cyan">SS promedio {networkBenchmarks.avgStrengthScore}</Badge>}
          />
          <div className="mt-2 h-[270px] w-full" role="img" aria-label={`Radar de activación muscular. Más bajo: ${weakest.muscle} ${weakest.score}%.`}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={muscleScores} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="muscle" tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Activación" dataKey="score" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.2} strokeWidth={2.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 rounded-xl border border-gravl-amber/20 bg-gravl-amber/[0.06] p-3">
            <p className="flex items-start gap-2 text-xs text-gravl-text-secondary">
              <AlertTriangle size={14} className="mt-px shrink-0 text-gravl-amber" aria-hidden />
              <span>
                <span className="font-semibold text-white">{weakest.muscle} al {weakest.score}%.</span> Volumen total del mes:{' '}
                <span className="tabular-nums font-semibold text-white">{fmtCompact(networkBenchmarks.totalVolumeMonthKg)} kg</span>.
              </span>
            </p>
            <Link
              href={`/community?new=1&focus=${encodeURIComponent(weakest.muscle)}`}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-gravl-amber hover:underline"
            >
              Crear reto <ArrowRight size={12} aria-hidden />
            </Link>
          </div>
        </Card>
      </div>

      {/* Heatmap + feed */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <PeakHeatmap />
        </div>
        <div className="xl:col-span-5">
          <LiveFeed />
        </div>
      </div>

      <p className="text-center text-[11px] text-gravl-text-muted">
        Ingreso anual en riesgo estimado: {fmtUsd(stats.revenueAtRiskUsd)} · cuota promedio de referencia USD 45/mes.
      </p>
    </div>
  );
}
