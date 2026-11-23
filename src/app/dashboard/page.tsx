'use client';

import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import {
  Activity, TrendingUp, Users, Dumbbell, Trophy, Flame,
  Clock, Sparkles, ArrowUpRight, ShieldCheck, ChevronRight,
  Filter,
} from 'lucide-react';
import {
  memberStats, retentionCohorts, liveWorkoutFeed, muscleScores, peakHoursData,
} from '@/data/mockGravlB2B';

// ─── SVG Sparkline Component ─────────────────────────────────────
function Sparkline({ points, color }: { points: number[]; color: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const width = 120;
  const height = 36;
  const range = max - min || 1;

  const path = points
    .map((val, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path
        d={`${path} L ${width} ${height} L 0 ${height} Z`}
        fill={`url(#spark-${color.replace('#', '')})`}
      />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Executive KPI Card ──────────────────────────────────────────
function ExecutiveKPICard({
  title, value, subtitle, delta, icon: Icon, color, sparkPoints, glowClass,
}: {
  title: string; value: string; subtitle: string; delta: string;
  icon: React.ElementType; color: string; sparkPoints: number[]; glowClass?: string;
}) {
  return (
    <div className={`gravl-card p-5 flex flex-col justify-between ${glowClass || ''} group`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
            {title}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="tabular-nums text-3xl font-black text-white tracking-tight">
              {value}
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5"
              style={{ background: `${color}18`, color }}
            >
              <ArrowUpRight size={12} />
              {delta}
            </span>
          </div>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>

      <div className="flex items-end justify-between mt-4 pt-3 border-t border-white/[0.05]">
        <p className="text-xs text-[#64748B] font-medium max-w-[140px] truncate">{subtitle}</p>
        <Sparkline points={sparkPoints} color={color} />
      </div>
    </div>
  );
}

// ─── Modern Peak Utilization Matrix (Fixes the ugly green table) ─
function ModernPeakMatrix() {
  const [selectedDay, setSelectedDay] = useState<'all' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'>('all');
  const days = [
    { key: 'mon', label: 'Lun' },
    { key: 'tue', label: 'Mar' },
    { key: 'wed', label: 'Mié' },
    { key: 'thu', label: 'Jue' },
    { key: 'fri', label: 'Vie' },
    { key: 'sat', label: 'Sáb' },
    { key: 'sun', label: 'Dom' },
  ] as const;

  const maxVal = 55; // Peak members capacity

  return (
    <div className="gravl-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#C6FF00]" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Horarios Pico & Telemetría de Ocupación
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/[0.06] text-[#94A3B8]">
            Saturación 6–8 PM: 94%
          </span>
        </div>
        <p className="text-xs text-[#64748B] mb-5">
          Distribución de afluencia por franja horaria. Permite optimizar entrenadores de piso y rotación de racks.
        </p>

        {/* Heatmap Grid with Sleek Pills */}
        <div className="space-y-1.5 overflow-x-auto pb-2">
          {/* Header Row */}
          <div className="grid grid-cols-8 gap-1.5 text-center text-[10px] font-bold text-[#64748B] pb-1">
            <div className="text-left pl-1">HORA</div>
            {days.map((d) => (
              <div key={d.key}>{d.label}</div>
            ))}
          </div>

          {/* Hourly Rows */}
          {peakHoursData.slice(1, 12).map((row) => (
            <div key={row.hour} className="grid grid-cols-8 gap-1.5 items-center">
              <span className="text-[11px] font-bold text-[#94A3B8] tabular-nums pl-1">
                {row.hour}
              </span>
              {days.map((d) => {
                const count = row[d.key];
                const pct = count / maxVal;
                // High contrast color coding:
                // Low (<0.3): Dark slate
                // Med (0.3 - 0.7): Emerald/Volt blend
                // High (>0.7): Intense glowing Volt
                const bgColor =
                  pct > 0.8
                    ? 'rgba(198, 255, 0, 0.85)'
                    : pct > 0.55
                    ? 'rgba(198, 255, 0, 0.45)'
                    : pct > 0.35
                    ? 'rgba(34, 197, 94, 0.25)'
                    : 'rgba(255, 255, 255, 0.04)';

                const textColor = pct > 0.8 ? '#080A0E' : pct > 0.55 ? '#F8FAFC' : '#64748B';

                return (
                  <div
                    key={d.key}
                    className="h-6 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110 hover:z-10 cursor-pointer shadow-sm"
                    style={{ background: bgColor }}
                    title={`${row.hour} ${d.label}: ${count} socios entrenando`}
                  >
                    <span className="text-[10px] font-bold tabular-nums" style={{ color: textColor }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/[0.06] text-xs text-[#64748B]">
        <span>CapEx Tip: Instalar 2º Cable Crossover reducirá esperas en hora pico.</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">Tranquilo</span>
          <span className="w-3 h-3 rounded bg-white/[0.04]" />
          <span className="w-3 h-3 rounded bg-[#22C55E]/30" />
          <span className="w-3 h-3 rounded bg-[#C6FF00]/50" />
          <span className="w-3 h-3 rounded bg-[#C6FF00]" />
          <span className="text-[10px] font-bold text-[#C6FF00]">Pico Máximo</span>
        </div>
      </div>
    </div>
  );
}

// ─── Custom Tooltip for Retention ────────────────────────────────
function RetentionTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="liquid-glass-static p-3 text-xs shadow-2xl border border-white/[0.15]">
      <p className="font-bold text-white mb-1.5">Mes {label} de Membresía</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-[#94A3B8]">{p.name}:</span>
          <span className="tabular-nums font-bold" style={{ color: p.color }}>
            {p.value}% Retención
          </span>
        </div>
      ))}
      <div className="mt-2 pt-2 border-t border-white/[0.08] text-[10px] text-[#C6FF00] font-semibold">
        +39% Socios retenidos gracias a GRAVL
      </div>
    </div>
  );
}

// ─── Main Executive Dashboard ────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-[1750px] mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            Command Center
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C6FF00]/15 text-[#C6FF00] border border-[#C6FF00]/30 tracking-wide">
              v1.54 Telemetry Engine
            </span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1 font-medium">
            Telemetría de retención, utilización de equipamiento y actividad en tiempo real de la red.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-white">
            <ShieldCheck size={15} className="text-[#38BDF8]" />
            <span>0% App Store Tax • Facturación Directa Stripe</span>
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <ExecutiveKPICard
          title="Socios Entrenando Ahora"
          value={String(memberStats.liveNow)}
          subtitle="Distribuidos en 3 sedes"
          delta="En vivo"
          icon={Activity}
          color="#22C55E"
          sparkPoints={[14, 18, 22, 19, 24, 28, 35, 42, 48, 54, 52, 24]}
          glowClass="gravl-card-glow"
        />
        <ExecutiveKPICard
          title="Weekly Attendance Lift"
          value={`+${memberStats.attendanceLift}%`}
          subtitle="3.4 sesiones/sem. por socio"
          delta="vs. Baseline"
          icon={TrendingUp}
          color="#C6FF00"
          sparkPoints={[2.2, 2.4, 2.5, 2.7, 2.9, 3.1, 3.2, 3.4]}
          glowClass="gravl-card-glow"
        />
        <ExecutiveKPICard
          title="90-Day Survival Rate"
          value={`${memberStats.survivalRate90Day}%`}
          subtitle="Lograron hito ≥5 entrenamientos"
          delta="+36.2% vs ind."
          icon={Users}
          color="#38BDF8"
          sparkPoints={[52, 58, 64, 72, 80, 85, 88.2]}
          glowClass="gravl-card-glow-cyan"
        />
        <ExecutiveKPICard
          title="Volumen Total Levantado"
          value={`${(memberStats.totalVolumeMonth / 1000).toFixed(0)}K kg`}
          subtitle="+14 pts Strength Score promedio"
          delta="Este Mes"
          icon={Dumbbell}
          color="#C6FF00"
          sparkPoints={[980, 1050, 1140, 1220, 1310, 1428]}
          glowClass="gravl-card-glow"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Retention Cohort Curve (Takes 7 of 12 columns) */}
        <div className="xl:col-span-7 gravl-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Flame size={16} className="text-[#C6FF00]" />
                Curva de Retención de Socios: Con GRAVL vs. Promedio Industria
              </h3>
              <span className="text-xs font-bold text-[#C6FF00] bg-[#C6FF00]/10 px-2.5 py-1 rounded-full border border-[#C6FF00]/25">
                91% Retención en Mes 6
              </span>
            </div>
            <p className="text-xs text-[#64748B] mb-6">
              Los socios que completan ≥5 sesiones en su primer mes con rutinas adaptadas retienen al 91%, frente al 52% de abandono típico.
            </p>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={retentionCohorts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="curveGravl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6FF00" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#C6FF00" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="curveIndustry" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#64748B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={(v) => `Mes ${v}`}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={(v) => `${v}%`}
                    domain={[30, 100]}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    tickLine={false}
                  />
                  <Tooltip content={<RetentionTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="withGravl"
                    stroke="#C6FF00"
                    strokeWidth={3}
                    fill="url(#curveGravl)"
                    name="Con GRAVL AI"
                  />
                  <Area
                    type="monotone"
                    dataKey="withoutGravl"
                    stroke="#64748B"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="url(#curveIndustry)"
                    name="Promedio Industria"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.06] text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.03]">
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Mes 1</span>
              <span className="tabular-nums font-bold text-white text-sm">97% vs 85%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03]">
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Mes 3 (Crítico)</span>
              <span className="tabular-nums font-bold text-white text-sm">94% vs 68%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#C6FF00]/5 border border-[#C6FF00]/15">
              <span className="text-[#C6FF00] block text-[10px] uppercase font-bold">Mes 6 (Hito B2B)</span>
              <span className="tabular-nums font-black text-[#C6FF00] text-sm">91% vs 52%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03]">
              <span className="text-[#64748B] block text-[10px] uppercase font-bold">Mes 12 (Anual)</span>
              <span className="tabular-nums font-bold text-white text-sm">88% vs 38%</span>
            </div>
          </div>
        </div>

        {/* Strength Score Muscle Radar (Takes 5 of 12 columns) */}
        <div className="xl:col-span-5 gravl-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Sparkles size={16} className="text-[#38BDF8]" />
                Muscle Activation & Strength Flower
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8]">
                SS Promedio: 245
              </span>
            </div>
            <p className="text-xs text-[#64748B] mb-2">
              Balance biomecánico acumulado de todos los socios entrenando en tus sedes.
            </p>

            <div className="h-[280px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={muscleScores} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="muscle" tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Activación Media"
                    dataKey="score"
                    stroke="#38BDF8"
                    fill="#38BDF8"
                    fillOpacity={0.22}
                    strokeWidth={2.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/[0.06] text-center">
            <div className="p-2 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-[#64748B] block">Piernas</span>
              <span className="tabular-nums font-bold text-white text-xs">85%</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-[#64748B] block">Espalda</span>
              <span className="tabular-nums font-bold text-white text-xs">82%</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-[#64748B] block">Pecho</span>
              <span className="tabular-nums font-bold text-white text-xs">78%</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02]">
              <span className="text-[10px] text-[#64748B] block">Core</span>
              <span className="tabular-nums font-bold text-amber-400 text-xs">65% ⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Row: Modern Heatmap + Rich Live Workout Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Heatmap (Takes 7 columns) */}
        <div className="xl:col-span-7">
          <ModernPeakMatrix />
        </div>

        {/* Live Social Workout Stream (Takes 5 columns) */}
        <div className="xl:col-span-5 gravl-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E]" />
                </span>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Live Workout Stream
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                Feed en Vivo
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {liveWorkoutFeed.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center font-bold text-xs text-white flex-shrink-0 group-hover:border-[#C6FF00]/40 transition-colors">
                      {evt.memberName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{evt.memberName}</span>
                        {evt.isPR && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-400 border border-amber-400/30">
                            <Trophy size={9} /> NEW PR
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                        {evt.exercise} • <span className="text-[#64748B]">{evt.locationName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 pl-3">
                    <span className="tabular-nums font-black text-sm text-[#C6FF00] block">
                      {evt.weight} {evt.unit}
                    </span>
                    <span className="text-[10px] text-[#64748B]">{evt.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#64748B]">
            <span>Sincronizado vía WebSocket con GRAVL Core API</span>
            <span className="text-[#C6FF00] font-bold text-[11px] flex items-center gap-1 cursor-pointer hover:underline">
              Ver feed completo <ChevronRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
