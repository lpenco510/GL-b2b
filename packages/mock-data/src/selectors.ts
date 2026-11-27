// Selectores puros sobre el dataset. Toda métrica que dependa de la sede
// seleccionada se calcula acá, para que Command Center, Retención y TopBar
// muestren exactamente los mismos números.

import {
  daysSince,
  feesAtRisk,
  isDormant,
  policyFor,
  type B2BMemberTelemetry,
  type Deal,
  type LocationScope,
  type MemberStatus,
  type PeakHourRow,
} from '@gravl/domain';
import { members, locations, organization, peakHoursData, REFERENCE_NOW } from './dataset';

export type MemberSegment = 'ALL' | MemberStatus | 'NEW_JOINERS' | 'CANCEL_INTENT' | 'DORMANT';

export const scopeLocations = (scope: LocationScope) =>
  scope === 'all' ? locations : locations.filter((l) => l.id === scope);

export const membersInScope = (scope: LocationScope) =>
  scope === 'all' ? members : members.filter((m) => m.locationId === scope);

export const isNewJoinerAtRisk = (m: B2BMemberTelemetry) =>
  daysSince(m.joinedAt, REFERENCE_NOW) <= 30 && m.workoutsFirst30Days < 5;

export function inSegment(m: B2BMemberTelemetry, segment: MemberSegment, deal?: Deal) {
  if (segment === 'ALL') return true;
  if (segment === 'CANCEL_INTENT') return !!m.cancelIntent;
  if (segment === 'DORMANT') {
    if (!deal || m.cancelIntent) return false;
    const { contactPolicy } = policyFor(deal, m.planId);
    // "Durmiente protegido": no viene y su plan prohíbe reactivarlo.
    return !contactPolicy.contactDormantPayers && isDormant(m, contactPolicy);
  }
  if (segment === 'NEW_JOINERS') return isNewJoinerAtRisk(m);
  return m.status === segment;
}

export function scopeStats(scope: LocationScope, deal?: Deal) {
  const list = membersInScope(scope);
  const locs = scopeLocations(scope);
  const count = (s: MemberStatus) => list.filter((m) => m.status === s).length;
  const atRisk = count('AT_RISK');
  const needsNudge = count('NEEDS_NUDGE');
  const liveNow = locs.reduce((acc, l) => acc + l.liveActiveMembersCount, 0);
  const capacity = locs.reduce((acc, l) => acc + l.floorCapacity, 0);
  const activeThisWeek = list.filter((m) => m.workoutsThisWeek > 0).length;

  // Cuotas en riesgo: la definición depende del modelo de CADA plan (ver @gravl/domain/engagement).
  const feesAtRiskValue = deal ? feesAtRisk(list, deal) : 0;

  return {
    total: list.length,
    onFire: count('ON_FIRE'),
    active: count('ACTIVE'),
    needsNudge,
    atRisk,
    newJoiners: list.filter(isNewJoinerAtRisk).length,
    liveNow,
    capacity,
    occupancyPct: capacity ? Math.round((liveNow / capacity) * 100) : 0,
    weeklyActiveRate: list.length ? Math.round((activeThisWeek / list.length) * 100) : 0,
    feesAtRisk: feesAtRiskValue,
    activationPct: Math.round((list.length / Math.max(1, organization.totalGymMembers * (scope === 'all' ? 1 : (locations.find((l) => l.id === scope)?.floorCapacity ?? 0) / locations.reduce((a, l) => a + l.floorCapacity, 0)))) * 100),
    cancelIntent: list.filter((m) => m.cancelIntent).length,
    locationsCount: locs.length,
  };
}

export function segmentCount(scope: LocationScope, segment: MemberSegment, deal?: Deal) {
  return membersInScope(scope).filter((m) => inSegment(m, segment, deal)).length;
}

/** Distribución de afluencia de la sede (proporcional a su share de socios). */
export function peakHoursForScope(scope: LocationScope): PeakHourRow[] {
  if (scope === 'all') return peakHoursData;
  const share = membersInScope(scope).length / members.length;
  return peakHoursData.map((r) => ({
    ...r,
    mon: Math.round(r.mon * share),
    tue: Math.round(r.tue * share),
    wed: Math.round(r.wed * share),
    thu: Math.round(r.thu * share),
    fri: Math.round(r.fri * share),
    sat: Math.round(r.sat * share),
    sun: Math.round(r.sun * share),
  }));
}

export function topChurnRisk(scope: LocationScope, limit = 5) {
  return membersInScope(scope)
    .filter((m) => m.status === 'AT_RISK' || m.status === 'NEEDS_NUDGE')
    .sort((a, b) => b.churnRisk - a.churnRisk)
    .slice(0, limit);
}

export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type DayKey = (typeof DAY_KEYS)[number];
export const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue', fri: 'Vie', sat: 'Sáb', sun: 'Dom',
};
/** Día de la semana del "ahora" de referencia, como clave del heatmap. */
export const TODAY_KEY: DayKey = 'mon'; // 23-nov-2026 es lunes
export const CURRENT_HOUR = 19;

/**
 * Historial sintético (determinístico) de sesiones por semana, últimas 8.
 * Las semanas posterior a la última sesión quedan en 0, así se ve la caída
 * que explica el riesgo en vez de una serie plana.
 */
export function memberWeeklyHistory(m: B2BMemberTelemetry): number[] {
  let seed = Number(m.userId.replace(/\D/g, '')) || 1;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const daysInactive = daysSince(m.lastWorkoutAt, REFERENCE_NOW);
  const tenureWeeks = Math.ceil(daysSince(m.joinedAt, REFERENCE_NOW) / 7);
  // Nivel "sano" previo: los inactivos solían entrenar 2–3 veces por semana.
  const base = m.status === 'ON_FIRE' || m.status === 'ACTIVE' ? m.workoutsLast30Days / 4.3 : 2 + rnd() * 1.2;
  return Array.from({ length: 8 }, (_, i) => {
    const weeksAgo = 7 - i;
    if (weeksAgo === 0) return m.workoutsThisWeek;
    if (weeksAgo >= tenureWeeks) return 0; // todavía no era socio
    if (weeksAgo * 7 < daysInactive - 6) return 0; // ya había dejado de venir
    return Math.max(m.status === 'ON_FIRE' ? 2 : 0, Math.round(base + (rnd() - 0.5) * 1.6));
  });
}

/** Factores legibles que explican el score de churn (explicabilidad del modelo). */
export function churnFactors(m: B2BMemberTelemetry, daysInactive: number): { label: string; weight: 'alto' | 'medio' | 'bajo' }[] {
  const out: { label: string; weight: 'alto' | 'medio' | 'bajo' }[] = [];
  if (daysInactive >= 14) out.push({ label: `${daysInactive} días sin entrenar`, weight: 'alto' });
  else if (daysInactive >= 5) out.push({ label: `${daysInactive} días sin entrenar`, weight: 'medio' });
  if (m.currentStreakWeeks === 0) out.push({ label: 'Perdió su racha semanal', weight: 'medio' });
  if (m.strengthScoreDelta30d < 0) out.push({ label: `Strength Score ${m.strengthScoreDelta30d} pts en 30 días`, weight: 'medio' });
  if (isNewJoinerAtRisk(m)) out.push({ label: `Solo ${m.workoutsFirst30Days} sesiones en su primer mes`, weight: 'alto' });
  if (m.workoutsLast30Days >= 12) out.push({ label: `${m.workoutsLast30Days} sesiones en 30 días`, weight: 'bajo' });
  if (!out.length) out.push({ label: 'Patrón de asistencia estable', weight: 'bajo' });
  return out;
}
