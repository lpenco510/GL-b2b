'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { locations, muscleScores, nudgeRules as seedRules, organization } from '@/data/mockGravlB2B';
import { isNewJoinerAtRisk, membersInScope, scopeLocations } from '@/data/selectors';
import { fmtInt, fmtUsd } from '@/lib/format';
import { Badge, Button, Card, CardHeader } from '@/components/ui/primitives';
import { ArrowRight, Check, Dumbbell, Send, Sparkles, Target, UserPlus, type LucideIcon } from 'lucide-react';

interface Action {
  id: string;
  icon: LucideIcon;
  color: string;
  priority: 'Alta' | 'Media';
  title: string;
  why: string;
  impact: string;
  done: boolean;
  doneLabel: string;
  cta: { label: string; onClick?: () => void; href?: string };
}

/**
 * Copiloto de operaciones: traduce la telemetría en 3–4 decisiones
 * concretas con impacto estimado en USD. Es lo que convierte el panel
 * de "lindo de mirar" a "lo abro todos los días".
 */
export default function RecommendedActions() {
  const { selectedLocationId, nudgedAt, markNudged, addToast, getMachineStatus, nudgeRules } = useApp();
  const router = useRouter();

  const actions = useMemo<Action[]>(() => {
    const list = membersInScope(selectedLocationId);
    const streakSaver = nudgeRules.find((r) => r.type === 'STREAK_SAVER') ?? seedRules[1];

    // 1) Rescate de socios en riesgo
    const atRisk = list.filter((m) => m.status === 'AT_RISK' && !nudgedAt[m.userId]);
    const atRiskRecoverable = Math.round(
      atRisk.reduce((acc, m) => acc + (m.churnRisk / 100) * organization.avgMonthlyFeeUsd * 12, 0) * (streakSaver.recoveryRate / 100),
    );
    const anyAtRisk = list.some((m) => m.status === 'AT_RISK');

    // 2) Altas nuevas que no llegaron al hito de 5 entrenamientos
    const newbies = list.filter((m) => isNewJoinerAtRisk(m) && !nudgedAt[m.userId]);

    // 3) Máquina más saturada operativa en el scope
    const machines = scopeLocations(selectedLocationId).flatMap((l) =>
      l.equipmentProfile.machines.map((m) => ({ ...m, location: l })),
    );
    const hottest = machines
      .filter((m) => getMachineStatus(m) === 'OPERATIONAL')
      .sort((a, b) => b.weeklyUsageRate - a.weeklyUsageRate)[0];

    // 4) Grupo muscular más débil de la cohorte
    const weakest = [...muscleScores].sort((a, b) => a.score - b.score)[0];

    const out: Action[] = [
      {
        id: 'rescue',
        icon: Send,
        color: '#EF4444',
        priority: 'Alta',
        title: atRisk.length ? `Rescatar ${fmtInt(atRisk.length)} socios en riesgo de baja` : 'Socios en riesgo contactados',
        why: atRisk.length
          ? `Llevan 14+ días sin entrenar. El push "Volvé suave" recupera al ${streakSaver.recoveryRate}% en 72 h.`
          : 'Todos los socios en riesgo recibieron un nudge hoy. Medimos la vuelta en 72 h.',
        impact: atRisk.length ? `≈ ${fmtUsd(atRiskRecoverable)}/año recuperables` : 'Seguimiento automático activo',
        done: anyAtRisk && atRisk.length === 0,
        doneLabel: 'Nudges enviados',
        cta: {
          label: `Enviar ${fmtInt(atRisk.length)} nudges`,
          onClick: () => {
            markNudged(atRisk.map((m) => m.userId));
            addToast(`${fmtInt(atRisk.length)} nudges en cola en el Push Engine con la marca de ${organization.name}.`, 'success', {
              label: 'Ver socios',
              onClick: () => router.push('/retention?segment=AT_RISK'),
            });
          },
        },
      },
      {
        id: 'onboarding',
        icon: UserPlus,
        color: '#38BDF8',
        priority: 'Alta',
        title: `${fmtInt(newbies.length)} altas nuevas por debajo del hito de 5 entrenamientos`,
        why: 'Quien llega a 5 sesiones en su primer mes retiene al 91% en el mes 6, contra 52% del promedio.',
        impact: `≈ ${fmtUsd(Math.round(newbies.length * 0.39 * organization.avgMonthlyFeeUsd * 6))} en LTV a 6 meses`,
        done: newbies.length === 0,
        doneLabel: 'Rutina asignada',
        cta: {
          label: 'Asignar "Confidence Builder"',
          onClick: () => {
            markNudged(newbies.map((m) => m.userId));
            addToast(`Rutina "Confidence Builder" de 30 min asignada a ${fmtInt(newbies.length)} socios nuevos.`, 'success');
          },
        },
      },
    ];

    if (hottest && hottest.weeklyUsageRate >= 85) {
      out.push({
        id: 'capex',
        icon: Dumbbell,
        color: '#F59E0B',
        priority: 'Media',
        title: `${hottest.name} al ${hottest.weeklyUsageRate}% en ${hottest.location.shortName}`,
        why: 'Saturación >85% genera esperas en hora pico, la queja #1 en encuestas de baja.',
        impact: `Sumar 1 unidad libera ≈ ${Math.round(hottest.weeklyUsageRate / (hottest.quantity + 1))}% de carga por equipo`,
        done: false,
        doneLabel: '',
        cta: { label: 'Ver en planta', href: '/locations-equipment' },
      });
    }

    out.push({
      id: 'challenge',
      icon: Target,
      color: '#C6FF00',
      priority: 'Media',
      title: `${weakest.muscle} es el grupo menos trabajado (${weakest.score}%)`,
      why: 'Un reto temático de 4 semanas sube la adherencia y equilibra el Strength Score de la cohorte.',
      impact: 'Retos activos: +22% de sesiones/semana',
      done: false,
      doneLabel: '',
      cta: { label: `Crear reto de ${weakest.muscle}`, href: `/community?new=1&focus=${encodeURIComponent(weakest.muscle)}` },
    });

    return out;
  }, [selectedLocationId, nudgedAt, markNudged, addToast, getMachineStatus, nudgeRules, router]);

  const scopeLabel =
    selectedLocationId === 'all' ? 'toda la red' : locations.find((l) => l.id === selectedLocationId)?.name ?? '';

  return (
    <Card glow="volt" className="p-5 sm:p-6">
      <CardHeader
        icon={Sparkles}
        title="Acciones recomendadas para hoy"
        subtitle={`Priorizadas por impacto en ingresos para ${scopeLabel}. Cada acción se ejecuta en un clic.`}
        action={<Badge tone="volt">Copiloto GRAVL</Badge>}
      />
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.id}
              className="flex flex-col rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.14]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${a.color}18`, color: a.color }}
                >
                  <Icon size={15} aria-hidden />
                </span>
                <Badge tone={a.priority === 'Alta' ? 'crimson' : 'neutral'}>Prioridad {a.priority.toLowerCase()}</Badge>
              </div>
              <p className="text-[13px] font-bold leading-snug text-white">{a.title}</p>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-gravl-text-secondary">{a.why}</p>
              <p className="tabular-nums mt-3 text-xs font-bold" style={{ color: a.color }}>
                {a.impact}
              </p>
              <div className="mt-3">
                {a.done ? (
                  <span className="inline-flex h-8 items-center gap-1.5 text-xs font-semibold text-gravl-emerald">
                    <Check size={14} aria-hidden /> {a.doneLabel}
                  </span>
                ) : a.cta.href ? (
                  <Link
                    href={a.cta.href}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 text-xs font-semibold text-white transition-colors hover:bg-white/[0.09]"
                  >
                    {a.cta.label} <ArrowRight size={13} aria-hidden />
                  </Link>
                ) : (
                  <Button size="sm" variant="soft" onClick={a.cta.onClick}>
                    {a.cta.label}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
