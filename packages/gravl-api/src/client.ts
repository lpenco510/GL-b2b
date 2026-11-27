/**
 * Cliente de la API pública de GRAVL. Respeta las convenciones documentadas:
 *  - Bearer token (personal `gat_…` u OAuth) ligado a UN usuario y sus scopes.
 *  - Rate limit 100 req / 15 min por app+usuario → 429 con Retry-After: backoff, nunca polling.
 *  - 403 = falta scope (no reintentar), 404 = no existe o es de otro usuario.
 *
 * Límite estructural para B2B: cada token ve a UN socio. Sirve para un coach
 * (decenas de clientes) pero no para leer miles de socios de una cadena:
 * eso requiere el canal interno (ver docs/07-integracion-gravl.md).
 */
import type {
  Equipment, Exercise, GravlStats, GravlUser, Page, PersonalRecord, ProblemDetails, Trophy, WorkoutDetail, WorkoutSummary,
} from './types';

export const GRAVL_API_BASE = 'https://api.gravl.ai';

export class GravlApiError extends Error {
  constructor(
    public status: number,
    public problem?: ProblemDetails,
  ) {
    super(problem?.detail ?? problem?.title ?? `GRAVL API ${status}`);
  }
  /** 403: el socio no concedió este scope. Se respeta: no se reintenta. */
  get missingScope() {
    return this.status === 403;
  }
}

export interface ClientOptions {
  token: string;
  baseUrl?: string;
  fetch?: typeof fetch;
  maxRetries?: number;
  /** Para tests: espera simulada. */
  sleep?: (ms: number) => Promise<void>;
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function createGravlClient(opts: ClientOptions) {
  const base = opts.baseUrl ?? GRAVL_API_BASE;
  const doFetch = opts.fetch ?? fetch;
  const sleep = opts.sleep ?? wait;
  const maxRetries = opts.maxRetries ?? 3;

  async function get<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(path, base);
    for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined) url.searchParams.set(k, String(v));

    for (let attempt = 0; ; attempt++) {
      const res = await doFetch(url.toString(), { headers: { Authorization: `Bearer ${opts.token}`, Accept: 'application/json' } });
      if (res.ok) return (await res.json()) as T;
      if (res.status === 429 && attempt < maxRetries) {
        const retryAfter = Number(res.headers.get('Retry-After'));
        await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 1000);
        continue;
      }
      let problem: ProblemDetails | undefined;
      try {
        problem = (await res.json()) as ProblemDetails;
      } catch {
        /* 401 y 429 vienen sin cuerpo */
      }
      throw new GravlApiError(res.status, problem);
    }
  }

  /** Recorre todas las páginas (pageSize máximo 100). Usar con moderación: cuenta para el rate limit. */
  async function all<T>(path: string, query: Record<string, string | number | undefined> = {}, maxPages = 10): Promise<T[]> {
    const out: T[] = [];
    for (let page = 1; page <= maxPages; page++) {
      const p = await get<Page<T>>(path, { ...query, page, pageSize: 100 });
      out.push(...p.items);
      if (!p.hasNextPage) break;
    }
    return out;
  }

  return {
    user: () => get<GravlUser>('/api/v1/user'),
    workouts: (q: { page?: number; pageSize?: number; startDate?: string; endDate?: string } = {}) => get<Page<WorkoutSummary>>('/api/v1/workouts', q),
    workoutsSince: (startDate: string) => all<WorkoutSummary>('/api/v1/workouts', { startDate }),
    workout: (id: string) => get<WorkoutDetail>(`/api/v1/workouts/${encodeURIComponent(id)}`),
    personalRecords: (q: { page?: number; pageSize?: number; exerciseId?: number } = {}) => get<Page<PersonalRecord>>('/api/v1/personal-records', q),
    stats: () => get<GravlStats>('/api/v1/stats'),
    trophies: (q: { page?: number; pageSize?: number } = {}) => get<Page<Trophy>>('/api/v1/trophies', q),
    exercises: (q: { page?: number; pageSize?: number; search?: string } = {}) => get<Page<Exercise>>('/api/v1/exercises', q),
    equipment: (q: { page?: number; pageSize?: number } = {}) => get<Page<Equipment>>('/api/v1/equipment', q),
  };
}

export type GravlClient = ReturnType<typeof createGravlClient>;
