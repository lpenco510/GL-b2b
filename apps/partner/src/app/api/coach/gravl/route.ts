import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createRateLimiter } from '@gravl/auth';
import { activitySnapshot, createGravlClient, GravlApiError, toKg } from '@gravl/gravl-api';

/**
 * Coach Studio · conexión en vivo con la API pública de GRAVL.
 *
 * Recibe el token de un cliente (personal `gat_…` u OAuth), lee su actividad y devuelve
 * solo lo que el coach necesita. Seguridad:
 *  - protegido por la sesión del portal (src/proxy.ts),
 *  - el token se usa una vez: no se guarda, no se loguea, no vuelve al navegador,
 *  - límite propio (20 consultas / 10 min por IP) además del de GRAVL (100 / 15 min),
 *  - nunca pedimos medidas corporales (measurements:read).
 */
const limiter = createRateLimiter({ max: 20, windowMs: 10 * 60_000 });
const TOKEN_RE = /^[A-Za-z0-9_.\-]{16,512}$/;

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  const h = await headers();
  const ip = (h.get('x-forwarded-for')?.split(',')[0] ?? 'local').trim();
  if (!limiter.hit(ip).allowed) return fail(429, 'Demasiadas consultas. Esperá unos minutos.');

  let token = '';
  try {
    const body = (await req.json()) as { token?: unknown };
    token = typeof body.token === 'string' ? body.token.trim() : '';
  } catch {
    return fail(400, 'Pedido inválido.');
  }
  if (!TOKEN_RE.test(token)) return fail(400, 'El token no tiene un formato válido.');

  const gravl = createGravlClient({ token, maxRetries: 1 });
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();

  try {
    const [user, stats, workouts, records] = await Promise.all([
      gravl.user(),
      gravl.stats(),
      gravl.workouts({ startDate: since, pageSize: 100 }),
      gravl.personalRecords({ pageSize: 5 }).catch(() => null),
    ]);
    const snapshot = activitySnapshot(workouts.items, stats, records?.items ?? [], new Date());
    return NextResponse.json(
      {
        client: { name: user.displayName ?? user.username ?? 'Cliente GRAVL', goal: user.goal },
        snapshot,
        totalXp: stats.totalXp,
        recentWorkouts: workouts.items.slice(0, 5).map((w) => ({
          id: w.id,
          name: w.name,
          date: w.startDate,
          minutes: w.durationMinutes,
          volumeKg: toKg(w.volume),
          prs: w.personalRecordCount,
        })),
        records: (records?.items ?? []).map((r) => ({
          exercise: r.exerciseName,
          type: r.type,
          weightKg: r.weight != null ? toKg(r.weight) : null,
          reps: r.reps,
          at: r.achievedAt,
        })),
        scopesMissing: records ? [] : ['records:read'],
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e) {
    if (e instanceof GravlApiError) {
      if (e.status === 401) return fail(401, 'Token inválido, vencido o revocado.');
      if (e.status === 403) return fail(403, `Al token le falta un permiso: ${e.problem?.detail ?? 'scope requerido'}`);
      if (e.status === 429) return fail(429, 'GRAVL limitó las consultas de este cliente. Probá en unos minutos.');
      return fail(502, `GRAVL respondió ${e.status}.`);
    }
    return fail(502, 'No pudimos conectar con api.gravl.ai.');
  }
}
