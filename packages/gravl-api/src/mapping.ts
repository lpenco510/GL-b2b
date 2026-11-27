/**
 * De la API de GRAVL a la telemetría que ve el partner.
 * Este archivo es el contrato entre "lo que el socio autorizó" y "lo que muestra el panel".
 */
import { DAY_MS, REFERENCE_NOW } from '@gravl/domain';
import type { GravlStats, PersonalRecord, WorkoutSummary } from './types';

export const LB_TO_KG = 0.45359237;
export const toKg = (lb: number) => Math.round(lb * LB_TO_KG * 10) / 10;

export interface ActivitySnapshot {
  workoutsLast30Days: number;
  workoutsThisWeek: number;
  currentStreakWeeks: number;
  lastWorkoutAt: string | null;
  volumeLast30DaysKg: number;
  prsLast30Days: number;
}

/**
 * Lo que hoy SÍ se puede calcular con la API pública (scopes workouts:read + stats:read + records:read).
 * Falta: en qué sede entrenó, Strength Score, readiness y "máquina ocupada" (hay que pedirlos).
 */
export function activitySnapshot(
  workouts: WorkoutSummary[],
  stats: GravlStats,
  records: PersonalRecord[] = [],
  now: Date = REFERENCE_NOW,
): ActivitySnapshot {
  const since = now.getTime() - 30 * DAY_MS;
  const recent = workouts.filter((w) => new Date(w.startDate).getTime() >= since);
  const last = [...workouts].sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
  return {
    workoutsLast30Days: recent.length,
    workoutsThisWeek: stats.streak.workoutsThisWeek,
    currentStreakWeeks: stats.streak.current,
    lastWorkoutAt: last?.startDate ?? null,
    volumeLast30DaysKg: Math.round(recent.reduce((a, w) => a + toKg(w.volume), 0)),
    prsLast30Days: records.filter((r) => new Date(r.achievedAt).getTime() >= since).length,
  };
}

/** Evento de PR para el feed del gimnasio (solo si el socio dio PUBLIC_PROFILE). */
export function prToFeedEvent(r: PersonalRecord, memberName: string) {
  return {
    memberName,
    exercise: r.exerciseName,
    weightKg: r.weight != null ? toKg(r.weight) : null,
    reps: r.reps,
    type: r.type,
    at: r.achievedAt,
  };
}
