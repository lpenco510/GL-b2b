/**
 * Reglas de contacto y de riesgo. Acá se decide, para cada socio y según el
 * acuerdo del partner, si se lo puede contactar, por qué canal y cuánta plata
 * está realmente en juego.
 */
import type { B2BMemberTelemetry } from './types';
import { policyFor, type ContactPolicy, type Deal, type MonetizationModel } from './deals';
import { daysBetween, REFERENCE_NOW } from './clock';

export type NudgeChannel = 'PUSH' | 'STAFF';

export interface NudgeDecision {
  allowed: boolean;
  channel?: NudgeChannel;
  /** Motivo legible: se muestra tal cual en la UI. */
  reason: string;
}

export const isDormant = (m: B2BMemberTelemetry, policy: ContactPolicy, now: Date = REFERENCE_NOW) =>
  daysBetween(m.lastWorkoutAt, now) >= policy.dormantAfterDays;

/**
 * Regla central del negocio. Orden de evaluación (el primero que aplica gana):
 *  1. Sin consentimiento de mensajes → nunca.
 *  2. Ya contactado dentro de la ventana → no (fatiga).
 *  3. Intención de baja → siempre se actúa (staff con oferta o push, según acuerdo).
 *  4. Durmiente en un acuerdo que prohíbe contactarlos → no.
 *  5. Inactivo o con riesgo → push.
 */
export function nudgeDecision(
  m: B2BMemberTelemetry,
  policy: ContactPolicy,
  opts: { lastNudgedAt?: string; now?: Date } = {},
): NudgeDecision {
  const now = opts.now ?? REFERENCE_NOW;
  if (!m.consents.includes('PARTNER_MESSAGING')) return { allowed: false, reason: 'Sin consentimiento para mensajes del gimnasio' };
  if (opts.lastNudgedAt && daysBetween(opts.lastNudgedAt, now) < Math.ceil(30 / policy.maxNudgesPer30d)) {
    return { allowed: false, reason: 'Ya contactado: respetamos el límite de frecuencia' };
  }
  if (m.cancelIntent) {
    return {
      allowed: true,
      channel: policy.cancelIntentHandler,
      reason: policy.cancelIntentHandler === 'STAFF' ? 'Intención de baja: llamado con oferta de retención' : 'Intención de baja: push de retención',
    };
  }
  if (isDormant(m, policy, now) && !policy.contactDormantPayers) {
    return { allowed: false, reason: 'Acuerdo: no se contacta a socios durmientes que pagan' };
  }
  if (m.status === 'AT_RISK' || m.status === 'NEEDS_NUDGE' || m.churnRisk >= 35) {
    return { allowed: true, channel: 'PUSH', reason: 'Inactividad creciente' };
  }
  return { allowed: false, reason: 'Socio activo: no hace falta contactarlo' };
}

/** Probabilidad de que una señal de intención de baja termine en baja si nadie actúa. */
export const CANCEL_PROBABILITY: Record<NonNullable<B2BMemberTelemetry['cancelIntent']>, number> = {
  CANCEL_PAGE_VISIT: 0.55,
  PAYMENT_FAILED: 0.4,
  FREEZE_REQUEST: 0.3,
  DOWNGRADE_ASKED: 0.25,
};

export const cancelIntentLabel: Record<NonNullable<B2BMemberTelemetry['cancelIntent']>, string> = {
  CANCEL_PAGE_VISIT: 'Entró a “dar de baja”',
  PAYMENT_FAILED: 'Débito rechazado',
  FREEZE_REQUEST: 'Pidió congelar',
  DOWNGRADE_ASKED: 'Preguntó por plan menor',
};

/**
 * Ingreso anual en riesgo. Definición distinta según el modelo:
 *  - ATTENDANCE/SPONSORED/SERVICE: inactividad → baja. Σ riesgo × cuota anual de inactivos.
 *  - BREAKAGE: la inactividad NO es riesgo (es el negocio). Solo cuenta la intención de baja.
 */
export function revenueAtRiskUsd(members: B2BMemberTelemetry[], model: MonetizationModel, monthlyFeeUsd: number): number {
  if (model === 'BREAKAGE') {
    return Math.round(
      members.reduce((acc, m) => acc + (m.cancelIntent ? CANCEL_PROBABILITY[m.cancelIntent] * monthlyFeeUsd * 12 : 0), 0),
    );
  }
  return Math.round(
    members
      .filter((m) => m.status === 'AT_RISK' || m.status === 'NEEDS_NUDGE' || m.cancelIntent)
      .reduce((acc, m) => acc + (m.churnRisk / 100) * monthlyFeeUsd * 12, 0),
  );
}

/** En BREAKAGE: ingreso de quienes pagan y no vienen. No se toca; se protege. */
export function dormantPayerRevenueUsd(members: B2BMemberTelemetry[], policy: ContactPolicy, monthlyFeeUsd: number) {
  const dormant = members.filter((m) => m.paymentStatus === 'CURRENT' && !m.cancelIntent && isDormant(m, policy));
  return { count: dormant.length, annualUsd: dormant.length * monthlyFeeUsd * 12 };
}

/**
 * Cuotas mensuales en riesgo en los próximos 12 meses, respetando el modelo de CADA plan.
 * Se expresa en cuotas (no en moneda) para no depender del precio de cada plan:
 * el partner lo multiplica por su cuota promedio.
 */
export function feesAtRisk(members: B2BMemberTelemetry[], deal: Deal): number {
  return Math.round(
    members.reduce((acc, m) => {
      const { monetization } = policyFor(deal, m.planId);
      if (monetization === 'BREAKAGE') return acc + (m.cancelIntent ? CANCEL_PROBABILITY[m.cancelIntent] * 12 : 0);
      if (m.status === 'AT_RISK' || m.status === 'NEEDS_NUDGE' || m.cancelIntent) return acc + (m.churnRisk / 100) * 12;
      return acc;
    }, 0),
  );
}

/** Decisión de contacto usando la política del plan del socio. */
export function nudgeDecisionFor(m: B2BMemberTelemetry, deal: Deal, opts: { lastNudgedAt?: string; now?: Date } = {}) {
  return nudgeDecision(m, policyFor(deal, m.planId).contactPolicy, opts);
}
