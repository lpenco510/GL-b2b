'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from 'recharts';
import {
  Activity, TrendingUp, Users, Dumbbell, Zap, Trophy, Flame,
} from 'lucide-react';
import {
  memberStats, retentionCohorts, liveWorkoutFeed, muscleScores, peakHoursData,
} from '@/data/mockGravlB2B';

// ─── KPI Card ────────────────────────────────────────────────────
function KPICard({
  title, value, subtitle, icon: Icon, color, trend,
}: {
  title: string; value: string; subtitle: string;
  icon: React.ElementType; color: string; trend?: string;
}) {
  return (
    <div className="gravl-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gravl-text-secondary uppercase tracking-wider">{title}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <div>
        <span className="tabular-nums text-2xl font-bold text-gravl-text">{value}</span>
        {trend && (
          <span className="ml-2 text-xs font-semibold text-gravl-emerald">{trend}</span>
        )}
      </div>
      <p className="text-xs text-gravl-text-muted">{subtitle}</p>
    </div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="liquid-glass-static px-3 py-2">
      <p className="text-xs font-semibold text-gravl-text mb-1">Month {label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          {p.name}: <span className="tabular-nums font-semibold">{p.value}%</span>
        </p>
      ))}
    </div>
  );
}

// ─── Peak Hours Heatmap ──────────────────────────────────────────
function PeakHoursHeatmap() {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxVal = Math.max(...peakHoursData.flatMap(r => days.map(d => r[d])));

  return (
    <div className="gravl-card p-5">
      <h3 className="text-sm font-semibold text-gravl-text mb-4">Peak Hours Heatmap</h3>
      <div className="overflow-x-auto">
        <div className="grid gap-1" style={{ gridTemplateColumns: `80px repeat(7, 1fr)`, minWidth: '400px' }}>
          <div />
          {dayLabels.map((d) => (
            <div key={d} className="text-center text-[10px] text-gravl-text-muted font-medium pb-1">{d}</div>
          ))}
          {peakHoursData.map((row) => (
            <React.Fragment key={row.hour}>
              <div className="text-xs text-gravl-text-muted font-medium flex items-center tabular-nums">{row.hour}</div>
              {days.map((d) => {
                const intensity = row[d] / maxVal;
                return (
                  <div
                    key={d}
                    className="rounded h-7 flex items-center justify-center transition-colors"
                    style={{
                      background: `rgba(198, 255, 0, ${intensity * 0.6})`,
                    }}
                    title={`${row.hour} ${d}: ${row[d]} members`}
                  >
                    <span className="text-[9px] tabular-nums text-gravl-text/70 font-medium">{row[d]}</span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-gravl-text">Command Center</h2>
        <p className="text-sm text-gravl-text-muted mt-1">Real-time telemetry across all locations</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Training Right Now"
          value={String(memberStats.liveNow)}
          subtitle="Across 3 locations"
          icon={Activity}
          color="#22C55E"
          trend="● Live"
        />
        <KPICard
          title="Weekly Attendance Lift"
          value={`+${memberStats.attendanceLift}%`}
          subtitle={`Avg ${memberStats.avgWorkoutsPerWeek} workouts/week per member`}
          icon={TrendingUp}
          color="#C6FF00"
          trend="vs. pre-GRAVL"
        />
        <KPICard
          title="90-Day Survival Rate"
          value={`${memberStats.survivalRate90Day}%`}
          subtitle="New members hitting 5-workout milestone"
          icon={Users}
          color="#38BDF8"
          trend="+6.2% ↑"
        />
        <KPICard
          title="Community Volume"
          value={`${(memberStats.totalVolumeMonth / 1000).toFixed(0)}K kg`}
          subtitle={`+${memberStats.avgStrengthScoreGrowth} avg Strength Score growth`}
          icon={Dumbbell}
          color="#C6FF00"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Retention Cohort Curve */}
        <div className="gravl-card p-5">
          <h3 className="text-sm font-semibold text-gravl-text mb-1">Retention & Cohort Curve</h3>
          <p className="text-xs text-gravl-text-muted mb-4">Members using GRAVL vs. Non-app Gym Average</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={retentionCohorts}>
              <defs>
                <linearGradient id="gradGravl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C6FF00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C6FF00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `M${v}`} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="withGravl" stroke="#C6FF00" fill="url(#gradGravl)" strokeWidth={2} name="With GRAVL" />
              <Area type="monotone" dataKey="withoutGravl" stroke="#64748B" fill="url(#gradAvg)" strokeWidth={2} strokeDasharray="5 5" name="Gym Average" />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value) => <span className="text-xs text-gravl-text-secondary">{value}</span>}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-gravl-volt rounded" />
              <span className="text-gravl-text-secondary">91% at Month 6 with GRAVL</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-gravl-text-muted rounded" style={{ borderTop: '1px dashed' }} />
              <span className="text-gravl-text-secondary">52% at Month 6 without</span>
            </div>
          </div>
        </div>

        {/* Muscle Flower Radar */}
        <div className="gravl-card p-5">
          <h3 className="text-sm font-semibold text-gravl-text mb-1">Gym Cohort Muscle Activation</h3>
          <p className="text-xs text-gravl-text-muted mb-4">Strength Score distribution by muscle group</p>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={muscleScores} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="muscle" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Cohort Average"
                dataKey="score"
                stroke="#38BDF8"
                fill="#38BDF8"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Peak Hours + Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PeakHoursHeatmap />

        {/* Live Workout Feed */}
        <div className="gravl-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-gravl-ping absolute inline-flex h-full w-full rounded-full bg-gravl-emerald opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gravl-emerald" />
            </span>
            <h3 className="text-sm font-semibold text-gravl-text">Live Workout Feed</h3>
          </div>
          <div className="space-y-3">
            {liveWorkoutFeed.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gravl-surface flex items-center justify-center flex-shrink-0">
                  <Dumbbell size={14} className="text-gravl-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gravl-text truncate">
                    <span className="font-semibold">{evt.memberName}</span>
                    {' '}
                    {evt.exercise}
                    {' '}
                    <span className="tabular-nums font-bold text-gravl-volt">{evt.weight} {evt.unit}</span>
                    {evt.isPR && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-gravl-volt font-semibold">
                        <Trophy size={10} /> PR!
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gravl-text-muted">{evt.locationName} • {evt.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
