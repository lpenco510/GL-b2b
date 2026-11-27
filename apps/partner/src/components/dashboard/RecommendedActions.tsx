'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { useDeal } from '@/components/layout/useTenant';
import { isNewJoinerAtRisk, membersInScope, scopeLocations } from '@gravl/mock-data';
import { CANCEL_PROBABILITY, fmtInt, isDormant, nudgeDecisionFor, policyFor } from '@gravl/domain';
import { Badge, Button, Card, CardHeader, tint } from '@gravl/ui';
import { ArrowRight, Check, Dumbbell, PhoneCall, Send, ShieldCheck, Sparkles, UserPlus, type LucideIcon } from 'lucide-react';

interface Action {
  id: string;
  icon: LucideIcon;
  color: string;
  kind: 'Urgente' | 'Hoy' | 'Esta semana' | 'Protegido';
  title: string;
  why: string;
  impact: string;
  done: boolean;
  doneLabel: string;
  cta?: { label: string; onClick?: () => void; href?: string };
}

/** Supuestos de la demo (se calibran con el grupo de control del piloto). */
const STAFF_SAVE_RATE = 0.35;
const PUSH_RETURN_RATE = 0.41;

/**
 * Copiloto: cada tarjeta nace de un dato que la app registra y respeta la política
 * del plan de cada socio (Flex se reactiva; abono fijo, no). Impacto en cuotas y visitas,
 * nunca en una moneda inventada.
 */
export default function RecommendedActions() {
  const { selectedLocationId, nudgedAt, markNudged, addToast, getMachineStatus } = useApp();
  const deal = useDeal();

  const actions = useMemo<Action[]>(() => {
    const list = membersInScope(selectedLocationId);
    const can = (m: (typeof list)[number]) => nudgeDecisionFor(m, deal, { lastNudgedAt: nudgedAt[m.userId] });
    const out: Action[] = [];

    // 1) Intención de baja (todos los planes): la atiende la sede.
    const intent = list.filter((m) => m.cancelIntent && can(m).allowed);
    const anyIntent = list.some((m) => m.cancelIntent);
    const saved = intent.reduce((a, m) => a + CANCEL_PROBABILITY[m.cancelIntent!] * 12, 0) * STAFF_SAVE_RATE;
    out.push({
      id: 'intent', icon: PhoneCall, color: 'var(--color-gravl-crimson)', kind: 'Urgente',
      title: intent.length ? `${fmtInt(intent.length)} socios quieren darse de baja` : 'Intenciones de baja derivadas',
      why: 'Entraron a "dar de baja", les rebotó el débito o pidieron congelar. La sede los llama con una oferta antes de que se vayan.',
      impact: intent.length ? `≈ ${fmtInt(Math.round(saved))} cuotas salvables en 12 meses` : 'La sede tiene la lista del día',
      done: anyIntent && intent.length === 0, doneLabel: 'Derivados a las sedes',
      cta: {
        label: `Derivar ${fmtInt(intent.length)} a las sedes`,
        onClick: () => {
          markNudged(intent.map((m) => m.userId));
          addToast(`Lista de ${fmtInt(intent.length)} llamados enviada a cada sede, con guion de retención.`, 'success');
        },
      },
    });

    // 2) Reactivación SOLO en planes donde la visita es ingreso (Flex).
    const reactivable = list.filter((m) => !m.cancelIntent && (m.status === 'AT_RISK' || m.status === 'NEEDS_NUDGE') && policyFor(deal, m.planId).monetization === 'ATTENDANCE' && can(m).allowed);
    out.push({
      id: 'flex', icon: Send, color: 'var(--color-gravl-text)', kind: 'Hoy',
      title: `${fmtInt(reactivable.length)} socios Flex dejaron de venir`,
      why: 'En Flex cada visita suma a la cuota: traerlos de vuelta es ingreso directo. Push con una sesión corta ya armada para su sede.',
      impact: `≈ ${fmtInt(Math.round(reactivable.length * PUSH_RETURN_RATE * 6))} visitas en el próximo mes`,
      done: reactivable.length === 0, doneLabel: 'Pushes enviados',
      cta: {
        label: `Enviar ${fmtInt(reactivable.length)} pushes`,
        onClick: () => {
          markNudged(reactivable.map((m) => m.userId));
          addToast(`${fmtInt(reactivable.length)} pushes programados en el horario habitual de cada socio.`, 'success');
        },
      },
    });

    // 3) Durmientes de abono fijo: protegidos por acuerdo.
    const protectedDormant = list.filter((m) => {
      const { contactPolicy } = policyFor(deal, m.planId);
      return !m.cancelIntent && !contactPolicy.contactDormantPayers && isDormant(m, contactPolicy);
    });
    out.push({
      id: 'dormant', icon: ShieldCheck, color: 'var(--color-gravl-cyan)', kind: 'Protegido',
      title: `${fmtInt(protectedDormant.length)} socios Plus/Total pagan y no vienen`,
      why: 'Por acuerdo no reciben campañas de reactivación: recordarles que pagan es el disparador de baja más barato que existe.',
      impact: `${fmtInt(protectedDormant.length * 12)} cuotas/año que no tocamos`,
      done: true, doneLabel: 'Fuera de toda campaña',
    });

    // 4) Altas nuevas bajo el hito.
    const newbies = list.filter((m) => isNewJoinerAtRisk(m) && can(m).allowed);
    out.push({
      id: 'onboarding', icon: UserPlus, color: 'var(--color-gravl-text)', kind: 'Esta semana',
      title: `${fmtInt(newbies.length)} altas nuevas no llegan a 5 entrenamientos`,
      why: 'El primer mes define la renovación. Rutina "Confidence Builder" de 30 min adaptada al equipamiento de su sede.',
      impact: 'Hito de 5 sesiones = la métrica que más predice la renovación',
      done: newbies.length === 0, doneLabel: 'Rutina asignada',
      cta: {
        label: 'Asignar rutina',
        onClick: () => {
          markNudged(newbies.map((m) => m.userId));
          addToast(`Rutina de 30 min asignada a ${fmtInt(newbies.length)} socios nuevos.`, 'success');
        },
      },
    });

    // 5) Equipamiento: la señal real es "máquina ocupada → cambiar ejercicio".
    const busiest = scopeLocations(selectedLocationId)
      .flatMap((l) => l.equipmentProfile.machines.map((m) => ({ ...m, location: l })))
      .filter((m) => getMachineStatus(m) === 'OPERATIONAL')
      .sort((a, b) => (b.busySwaps30d ?? 0) - (a.busySwaps30d ?? 0))[0];
    if (busiest && (busiest.busySwaps30d ?? 0) > 0) {
      out.push({
        id: 'equipment', icon: Dumbbell, color: 'var(--color-gravl-amber)', kind: 'Esta semana',
        title: `${busiest.name} en ${busiest.location.shortName}: ${fmtInt(busiest.busySwaps30d ?? 0)} veces "ocupada"`,
        why: 'Socios que tocaron "¿Máquina ocupada? → cambiar ejercicio" en los últimos 30 días. Es demanda insatisfecha medida, no estimada.',
        impact: `${Math.round(((busiest.busySwaps30d ?? 0) / Math.max(1, busiest.loggedSets30d ?? 1)) * 100)}% de las veces que la buscaron`,
        done: false, doneLabel: '', cta: { label: 'Ver equipamiento', href: '/locations-equipment' },
      });
    }
    return out;
  }, [selectedLocationId, nudgedAt, markNudged, addToast, getMachineStatus, deal]);

  return (
    <Card className="p-5 sm:p-6">
      <CardHeader
        icon={Sparkles}
        title="Qué hacer hoy"
        subtitle="Cada acción respeta la política del plan del socio. Se ejecuta en un clic y queda registrada."
        action={<Badge tone="ink">Copiloto GRAVL</Badge>}
      />
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.id} className="gravl-card gravl-card-interactive flex flex-col !shadow-none p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: tint(a.color, 10), color: a.color }}>
                  <Icon size={15} aria-hidden />
                </span>
                <span className="gravl-label" style={a.kind === 'Urgente' ? { color: 'var(--color-gravl-crimson)' } : undefined}>{a.kind}</span>
              </div>
              <p className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-gravl-text">{a.title}</p>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-gravl-text-muted">{a.why}</p>
              <p className="mt-4 border-t border-gravl-line pt-3 text-[13px] font-semibold text-gravl-text">{a.impact}</p>
              <div className="mt-3">
                {a.done ? (
                  <span className="inline-flex h-8 items-center gap-1.5 text-[13px] font-semibold text-gravl-emerald">
                    <Check size={15} aria-hidden /> {a.doneLabel}
                  </span>
                ) : a.cta?.href ? (
                  <Link href={a.cta.href} className="group/link inline-flex h-8 items-center gap-1.5 text-[13px] font-semibold text-gravl-text">
                    {a.cta.label} <ArrowRight size={14} className="transition-transform duration-200 group-hover/link:translate-x-1" aria-hidden />
                  </Link>
                ) : a.cta ? (
                  <Button size="sm" variant={a.kind === 'Urgente' ? 'primary' : 'ink'} onClick={a.cta.onClick}>{a.cta.label}</Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
