'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useDeal } from '@/components/layout/useTenant';
import { locations, muscleScores, nudgeRules as seedRules, organization, isNewJoinerAtRisk, membersInScope, scopeLocations } from '@gravl/mock-data';
import { CANCEL_PROBABILITY, dormantPayerRevenueUsd, fmtInt, fmtUsd, nudgeDecision, northStarLabel } from '@gravl/domain';
import { Badge, Button, Card, CardHeader } from '@gravl/ui';
import { ArrowRight, Check, Crown, Dumbbell, Phone, Send, ShieldCheck, Sparkles, Target, UserPlus, type LucideIcon } from 'lucide-react';

interface Action {
  id: string;
  icon: LucideIcon;
  color: string;
  priority: 'Alta' | 'Media' | 'Info';
  title: string;
  why: string;
  impact: string;
  done: boolean;
  doneLabel: string;
  cta?: { label: string; onClick?: () => void; href?: string };
}

/** Supuestos de conversión de la demo (calibrar con datos reales de cada partner). */
const STAFF_SAVE_RATE = 0.35;
const PRO_CONVERSION = 0.08;
const PRO_PRICE_USD = 7.99;

/**
 * Copiloto: traduce la telemetría en decisiones con impacto en USD.
 * Las acciones NO son universales: dependen del modelo de negocio del acuerdo.
 *  - ATTENDANCE: rescatar inactivos y llevar altas al hito de 5 sesiones.
 *  - BREAKAGE: actuar solo sobre intención de baja, proteger a los durmientes y vender Pro.
 */
export default function RecommendedActions() {
  const { selectedLocationId, nudgedAt, markNudged, addToast, getMachineStatus, nudgeRules } = useApp();
  const deal = useDeal();
  const router = useRouter();
  const fee = organization.avgMonthlyFeeUsd;

  const actions = useMemo<Action[]>(() => {
    const list = membersInScope(selectedLocationId);
    const policy = deal.contactPolicy;
    const decide = (m: (typeof list)[number]) => nudgeDecision(m, policy, { lastNudgedAt: nudgedAt[m.userId] });
    const out: Action[] = [];

    if (deal.monetization === 'BREAKAGE') {
      const intent = list.filter((m) => m.cancelIntent && decide(m).allowed);
      const anyIntent = list.some((m) => m.cancelIntent);
      const saved = Math.round(intent.reduce((a, m) => a + CANCEL_PROBABILITY[m.cancelIntent!] * fee * 12, 0) * STAFF_SAVE_RATE);
      out.push({
        id: 'intent', icon: Phone, color: '#EF4444', priority: 'Alta',
        title: intent.length ? `${fmtInt(intent.length)} socios con intención de baja` : 'Intenciones de baja derivadas',
        why: 'Entraron a “dar de baja”, les rebotó el débito o pidieron congelar. Recepción los llama con una oferta (congelar, plan menor) antes de que se vayan.',
        impact: intent.length ? `≈ ${fmtUsd(saved)}/año salvables` : 'Recepción tiene la lista del día',
        done: anyIntent && intent.length === 0, doneLabel: 'Derivados a recepción',
        cta: {
          label: `Derivar ${fmtInt(intent.length)} a recepción`,
          onClick: () => {
            markNudged(intent.map((m) => m.userId));
            addToast(`Lista de ${fmtInt(intent.length)} llamados enviada a recepción con guion de retención.`, 'success');
          },
        },
      });

      const dormant = dormantPayerRevenueUsd(list, policy, fee);
      out.push({
        id: 'dormant', icon: ShieldCheck, color: '#38BDF8', priority: 'Info',
        title: `${fmtInt(dormant.count)} socios pagan y no vienen`,
        why: `Por acuerdo, quedan fuera de toda campaña de reactivación. Contactarlos llena la sala en hora pico y les recuerda que están pagando.`,
        impact: `${fmtUsd(dormant.annualUsd)}/año protegidos`,
        done: true, doneLabel: 'Protegidos por la política de contacto',
      });

      const proCandidates = list.filter((m) => m.status === 'ON_FIRE' && !m.macrosActive);
      const share = deal.pricing.partnerRevSharePct / 100;
      out.push({
        id: 'upsell', icon: Crown, color: '#C6FF00', priority: 'Media',
        title: `${fmtInt(proCandidates.length)} socios muy activos sin GRAVL Pro`,
        why: 'Son los que más valoran la app. Oferta in-app de Pro con la marca del gimnasio; el partner cobra revenue share sin vender nada.',
        impact: `≈ ${fmtUsd(Math.round(proCandidates.length * PRO_CONVERSION * PRO_PRICE_USD * 12 * share))}/año para el partner`,
        done: false, doneLabel: '',
        cta: { label: 'Activar oferta in-app', onClick: () => addToast(`Oferta de Pro programada para ${fmtInt(proCandidates.length)} socios.`, 'success') },
      });
    } else {
      const streakSaver = nudgeRules.find((r) => r.type === 'STREAK_SAVER') ?? seedRules[1];
      const atRisk = list.filter((m) => m.status === 'AT_RISK' && decide(m).allowed);
      const anyAtRisk = list.some((m) => m.status === 'AT_RISK');
      const recoverable = Math.round(atRisk.reduce((a, m) => a + (m.churnRisk / 100) * fee * 12, 0) * (streakSaver.recoveryRate / 100));
      out.push({
        id: 'rescue', icon: Send, color: '#EF4444', priority: 'Alta',
        title: atRisk.length ? `Rescatar ${fmtInt(atRisk.length)} socios en riesgo de baja` : 'Socios en riesgo contactados',
        why: atRisk.length
          ? `Llevan 14+ días sin entrenar y aceptaron mensajes del gimnasio. El push “Volvé suave” recupera al ${streakSaver.recoveryRate}% en 72 h.`
          : 'Todos los contactables recibieron un nudge. Medimos la vuelta en 72 h.',
        impact: atRisk.length ? `≈ ${fmtUsd(recoverable)}/año recuperables` : 'Seguimiento automático activo',
        done: anyAtRisk && atRisk.length === 0, doneLabel: 'Nudges enviados',
        cta: {
          label: `Enviar ${fmtInt(atRisk.length)} nudges`,
          onClick: () => {
            markNudged(atRisk.map((m) => m.userId));
            addToast(`${fmtInt(atRisk.length)} nudges en cola con la marca de ${organization.name}.`, 'success', {
              label: 'Ver socios', onClick: () => router.push('/retention?segment=AT_RISK'),
            });
          },
        },
      });

      const newbies = list.filter((m) => isNewJoinerAtRisk(m) && decide(m).allowed);
      out.push({
        id: 'onboarding', icon: UserPlus, color: '#38BDF8', priority: 'Alta',
        title: `${fmtInt(newbies.length)} altas nuevas por debajo del hito de 5 entrenamientos`,
        why: 'Quien llega a 5 sesiones en su primer mes retiene al 91% en el mes 6, contra 52% del promedio.',
        impact: `≈ ${fmtUsd(Math.round(newbies.length * 0.39 * fee * 6))} en LTV a 6 meses`,
        done: newbies.length === 0, doneLabel: 'Rutina asignada',
        cta: {
          label: 'Asignar “Confidence Builder”',
          onClick: () => {
            markNudged(newbies.map((m) => m.userId));
            addToast(`Rutina “Confidence Builder” asignada a ${fmtInt(newbies.length)} socios nuevos.`, 'success');
          },
        },
      });
    }

    const hottest = scopeLocations(selectedLocationId)
      .flatMap((l) => l.equipmentProfile.machines.map((m) => ({ ...m, location: l })))
      .filter((m) => getMachineStatus(m) === 'OPERATIONAL')
      .sort((a, b) => b.weeklyUsageRate - a.weeklyUsageRate)[0];
    if (hottest && hottest.weeklyUsageRate >= 85) {
      out.push({
        id: 'capex', icon: Dumbbell, color: '#F59E0B', priority: 'Media',
        title: `${hottest.name} al ${hottest.weeklyUsageRate}% en ${hottest.location.shortName}`,
        why: deal.contactPolicy.avoidPeakHours
          ? 'Las rutinas ya sugieren horarios valle a quien entrena en pico. Si sigue saturada, es CapEx.'
          : 'Saturación >85% genera esperas en hora pico, la queja #1 en encuestas de baja.',
        impact: `Sumar 1 unidad libera ≈ ${Math.round(hottest.weeklyUsageRate / (hottest.quantity + 1))}% de carga por equipo`,
        done: false, doneLabel: '', cta: { label: 'Ver en planta', href: '/locations-equipment' },
      });
    }

    if (deal.monetization !== 'BREAKAGE') {
      const weakest = [...muscleScores].sort((a, b) => a.score - b.score)[0];
      out.push({
        id: 'challenge', icon: Target, color: '#C6FF00', priority: 'Media',
        title: `${weakest.muscle} es el grupo menos trabajado (${weakest.score}%)`,
        why: 'Un reto temático de 4 semanas sube la adherencia y equilibra el Strength Score de la cohorte.',
        impact: 'Retos activos: +22% de sesiones/semana',
        done: false, doneLabel: '',
        cta: { label: `Crear reto de ${weakest.muscle}`, href: `/community?new=1&focus=${encodeURIComponent(weakest.muscle)}` },
      });
    }
    return out;
  }, [selectedLocationId, nudgedAt, markNudged, addToast, getMachineStatus, nudgeRules, router, deal, fee]);

  const scopeLabel = selectedLocationId === 'all' ? 'toda la red' : locations.find((l) => l.id === selectedLocationId)?.name ?? '';

  return (
    <Card glow="volt" className="p-5 sm:p-6">
      <CardHeader
        icon={Sparkles}
        title="Acciones recomendadas para hoy"
        subtitle={`Optimizando “${northStarLabel[deal.northStar]}” para ${scopeLabel}, según tu acuerdo con GRAVL.`}
        action={<Badge tone="volt">Copiloto GRAVL</Badge>}
      />
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.id} className="flex flex-col rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.14]">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${a.color}18`, color: a.color }}>
                  <Icon size={15} aria-hidden />
                </span>
                <Badge tone={a.priority === 'Alta' ? 'crimson' : a.priority === 'Info' ? 'cyan' : 'neutral'}>
                  {a.priority === 'Info' ? 'Informativo' : `Prioridad ${a.priority.toLowerCase()}`}
                </Badge>
              </div>
              <p className="text-[13px] font-bold leading-snug text-white">{a.title}</p>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-gravl-text-secondary">{a.why}</p>
              <p className="tabular-nums mt-3 text-xs font-bold" style={{ color: a.color }}>{a.impact}</p>
              <div className="mt-3">
                {a.done ? (
                  <span className="inline-flex h-8 items-center gap-1.5 text-xs font-semibold text-gravl-emerald">
                    <Check size={14} aria-hidden /> {a.doneLabel}
                  </span>
                ) : a.cta?.href ? (
                  <Link href={a.cta.href} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 text-xs font-semibold text-white transition-colors hover:bg-white/[0.09]">
                    {a.cta.label} <ArrowRight size={13} aria-hidden />
                  </Link>
                ) : a.cta ? (
                  <Button size="sm" variant="soft" onClick={a.cta.onClick}>{a.cta.label}</Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
