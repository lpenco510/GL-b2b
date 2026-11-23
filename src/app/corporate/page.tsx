'use client';

import React from 'react';
import Link from 'next/link';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { departments, K_ANONYMITY_MIN, readinessTrend } from '@/data/mockGravlB2B';
import { fmtInt, fmtPct } from '@/lib/format';
import { Badge, Card, CardHeader, KpiTile, PageHeader, ProgressBar } from '@/components/ui/primitives';
import { ArrowRight, Battery, Brain, Building2, EyeOff, Heart, Lightbulb, Moon, ShieldCheck } from 'lucide-react';

const readinessColor = (s: number) => (s >= 75 ? '#22C55E' : s >= 65 ? '#F59E0B' : '#EF4444');

export default function CorporatePage() {
  const visible = departments.filter((d) => d.members >= K_ANONYMITY_MIN);
  const hidden = departments.filter((d) => d.members < K_ANONYMITY_MIN);
  const headcount = departments.reduce((a, d) => a + d.members, 0);
  const participation = Math.round(departments.reduce((a, d) => a + d.activeRate * d.members, 0) / headcount);
  const worst = [...visible].sort((a, b) => b.burnoutRisk - a.burnoutRisk)[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corporate Wellness"
        badge={<Badge tone="cyan">Nimbus Tech LATAM</Badge>}
        description="Readiness del equipo, prevención de burnout y adopción del beneficio. Datos agregados y anonimizados por área."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile label="Readiness promedio" value="74%" delta="+5 pts en 8 semanas" hint="HRV + sueño, agregado" icon={Heart} color="#22C55E" spark={readinessTrend.map((r) => r.readiness)} glow="volt" />
        <KpiTile label="Sueño promedio" value="7,2 h" delta="+0,4 h" hint="Apple Health / Garmin" icon={Moon} color="#38BDF8" spark={readinessTrend.map((r) => r.sleep)} glow="cyan" />
        <KpiTile label="Riesgo de burnout" value="12%" delta="−3 pts" deltaDirection="down" deltaGood hint="Readiness < 50% por 2+ semanas" icon={Battery} color="#F59E0B" spark={[17, 16, 16, 15, 14, 13, 12]} />
        <KpiTile label="Participación" value={fmtPct(participation)} delta={`${fmtInt(headcount)} empleados elegibles`} deltaDirection="none" hint="Entrenó al menos 1 vez esta semana" icon={Brain} color="#C6FF00" spark={[52, 55, 58, 60, 61, 64, participation]} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="p-5 sm:p-6 xl:col-span-7">
          <CardHeader icon={Heart} iconColor="#22C55E" title="Readiness y sueño · últimas 8 semanas" subtitle="Tendencia de toda la compañía." />
          <div className="mt-4 h-[240px]" role="img" aria-label="Readiness subió de 69% a 74% en 8 semanas; sueño de 6,8 a 7,2 horas.">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readinessTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="r" domain={[60, 80]} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                <YAxis yAxisId="s" orientation="right" domain={[6, 8]} hide />
                <Tooltip
                  contentStyle={{ background: 'rgba(16,20,29,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: '#F8FAFC', fontWeight: 700 }}
                />
                <Line yAxisId="r" type="monotone" dataKey="readiness" name="Readiness %" stroke="#22C55E" strokeWidth={2.5} dot={false} />
                <Line yAxisId="s" type="monotone" dataKey="sleep" name="Sueño (h)" stroke="#38BDF8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card glow="crimson" className="flex flex-col p-5 sm:p-6 xl:col-span-5">
          <CardHeader icon={Lightbulb} iconColor="#F59E0B" title="Recomendación de la semana" />
          {worst && (
            <div className="mt-4 flex flex-1 flex-col">
              <p className="text-lg font-bold leading-snug text-white">
                {worst.name}: readiness {worst.avgReadiness}% y riesgo de burnout {worst.burnoutRisk}%.
              </p>
              <p className="mt-2 text-sm text-gravl-text-secondary">
                Es el área con peor recuperación. Un reto por equipos de sueño + 3 sesiones cortas por semana bajó el burnout 6 pts en equipos comparables.
              </p>
              <div className="mt-auto pt-5">
                <Link href="/community?new=1" className="inline-flex items-center gap-1.5 rounded-xl bg-gravl-volt px-4 py-2.5 text-sm font-semibold text-gravl-canvas hover:bg-gravl-volt-hover">
                  Lanzar reto para {worst.name} <ArrowRight size={15} aria-hidden />
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <CardHeader icon={Building2} iconColor="#38BDF8" title="Áreas" subtitle={`Solo mostramos áreas con ${K_ANONYMITY_MIN}+ personas (k-anonimato).`} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <caption className="sr-only">Métricas agregadas por área</caption>
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">
                <th scope="col" className="px-3 py-3">Área</th>
                <th scope="col" className="px-3 py-3">Personas</th>
                <th scope="col" className="px-3 py-3">Readiness</th>
                <th scope="col" className="px-3 py-3">Participación</th>
                <th scope="col" className="px-3 py-3">Burnout</th>
                <th scope="col" className="px-3 py-3">Strength Score</th>
                <th scope="col" className="px-3 py-3 text-right">Pasos/día</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((d) => (
                <tr key={d.name} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-3 py-3 text-sm font-semibold text-white">{d.name}</td>
                  <td className="tabular-nums px-3 py-3 text-sm text-gravl-text-secondary">{d.members}</td>
                  <td className="tabular-nums px-3 py-3 text-sm font-bold" style={{ color: readinessColor(d.avgReadiness) }}>{d.avgReadiness}%</td>
                  <td className="px-3 py-3">
                    <div className="flex w-32 items-center gap-2">
                      <ProgressBar value={d.activeRate} label={`Participación ${d.activeRate}%`} />
                      <span className="tabular-nums w-9 text-right text-xs text-gravl-text-secondary">{d.activeRate}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={d.burnoutRisk >= 18 ? 'crimson' : d.burnoutRisk >= 10 ? 'amber' : 'emerald'}>{d.burnoutRisk}%</Badge>
                  </td>
                  <td className="tabular-nums px-3 py-3 text-sm font-bold text-gravl-cyan">{d.avgStrength}</td>
                  <td className="tabular-nums px-3 py-3 text-right text-sm text-gravl-text-secondary">{fmtInt(d.stepsAvg)}</td>
                </tr>
              ))}
              {hidden.length > 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-3 text-xs text-gravl-text-muted">
                    <span className="flex items-center gap-2">
                      <EyeOff size={13} aria-hidden />
                      {hidden.length} {hidden.length === 1 ? 'área oculta' : 'áreas ocultas'} ({hidden.reduce((a, d) => a + d.members, 0)} personas) por tener menos de {K_ANONYMITY_MIN} integrantes. Sus datos sí cuentan en los totales.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="flex items-start gap-3 border-gravl-cyan/20 p-4">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-gravl-cyan" aria-hidden />
        <p className="text-xs leading-relaxed text-gravl-text-secondary">
          <span className="font-semibold text-white">Privacidad por diseño.</span> RR. HH. solo ve métricas agregadas por área. Peso corporal, notas médicas y fotos de comidas son privadas del empleado y nunca salen de su dispositivo sin consentimiento.
        </p>
      </Card>
    </div>
  );
}
