/**
 * Tipos de la API pública de GRAVL v1, transcritos de gravl.ai/es/developers/endpoints.
 * Convenciones de la API: pesos en LIBRAS, distancias en metros, duraciones de serie en segundos,
 * fechas UTC ISO 8601, enums en camelCase (tratar valores nuevos como compatibles).
 */

export type Scope =
  | 'profile:read'
  | 'workouts:read'
  | 'records:read'
  | 'measurements:read'
  | 'stats:read'
  | 'splits:read'
  | 'exercises:read';

export interface Page<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** GET /api/v1/user · profile:read */
export interface GravlUser {
  id: string;
  displayName: string | null;
  username: string | null;
  weightUnit: 'kilograms' | 'pounds';
  distanceUnit: 'kilometers' | 'miles';
  gender: 'male' | 'female' | 'other' | null;
  height: number | null;
  heightUnit: 'centimeters' | 'feetInches';
  goal: 'stronger' | 'muscleMass' | 'lean' | 'generalFitness' | null;
}

/** GET /api/v1/workouts · workouts:read (paginado) */
export interface WorkoutSummary {
  id: string;
  name: string;
  notes: string | null;
  startDate: string;
  endDate: string;
  durationMinutes: number;
  type: string;
  /** Libras. */
  volume: number;
  calories: number;
  personalRecordCount: number;
  exerciseCount: number;
}

export interface WorkoutSet {
  order: number;
  reps: number;
  /** Libras. */
  weight: number;
  duration: number | null;
  distance: number | null;
  rpe: number | null;
  setType: 'normal' | 'warmup' | 'dropSet' | 'failure';
}

/** GET /api/v1/workouts/{id} · workouts:read */
export interface WorkoutDetail extends Omit<WorkoutSummary, 'exerciseCount'> {
  exercises: { exerciseId: number; exerciseName: string; supersetId: number | null; sets: WorkoutSet[] }[];
}

/** GET /api/v1/personal-records · records:read (paginado) */
export interface PersonalRecord {
  exerciseId: number;
  exerciseName: string;
  type: 'oneRepMax' | 'weightMax' | 'volumeMax' | 'repetitionMax' | 'durationMax' | 'distanceMax';
  reps: number | null;
  weight: number | null;
  duration: number | null;
  distance: number | null;
  workoutId: string | null;
  achievedAt: string;
}

/** GET /api/v1/stats · stats:read */
export interface GravlStats {
  streak: { current: number; longest: number; workoutsThisWeek: number };
  totalXp: number;
  trophyCount: number;
}

/** GET /api/v1/trophies · stats:read (paginado) */
export interface Trophy {
  type: string;
  exerciseId: number | null;
  exerciseName: string | null;
  achievedAt: string;
}

/** GET /api/v1/exercises · exercises:read (paginado) */
export interface Exercise {
  id: number;
  name: string;
  description: string | null;
  category: string;
  type: string;
  muscle: string;
  secondaryMuscles: string[];
  equipment: string[];
}

/** GET /api/v1/equipment · exercises:read (paginado) */
export interface Equipment {
  id: number;
  name: string;
  subtitle: string | null;
  category: string;
}

/** Error RFC 7807 que devuelve la API. */
export interface ProblemDetails {
  status: number;
  title: string;
  detail?: string;
}
